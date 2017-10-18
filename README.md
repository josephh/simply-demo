
# Executive Summary
Simplyhealth is embarking on a transformative Digital Business journey. As part of our technology strategy, we're introducing the use of headless CMS services. These services play an important business role by allowing centralised management of cross-channel copy and media. They also allows us to separate the content itself from channel specific formatting, layout and delivery of that content across web, email, DM as well as 3rd party channels.

##  Preferred CMS (View)
AEM is our chosen platform to deliver web specific site management and layout services whilst integrating with the central content services API to obtain copy and media for use in page scaffolding and components.

1. Understanding/ assumptions
  * There are a number of headless CMSs.
  * Some common content authoring approaches and conventions are in place across the headless CMSs.
  * Copy and media publishing is done via the headless CMS's own UI.
  * AEM is intended to aggregate content at authoring time, render and cache it.

## Brief
Scenario Activity

Describe, in your own words, how you might integrate a headless CMS style API service into AEM considering the following areas:

### The content authoring process (e.g. approval phases for copy & media and page/site publishing)
1. Clarifications
  * Does this include bi-directional interaction with the headless CMSs?  I.e. pushing copy and content up to the headless CMS as well as fetching?

1. Employ typical AEM workflow
  1. author chooses workflow (or is delegated a workflow step)
  1. editor approves
  1. enhanced page activation? Check content is still available in Headless CMS? -> site administrator publishes

### AEM component design (e.g. use of external content from an external API)
Components
1. A suitable strategy may fall out - to some extent - from how headless CMSs are used.  What authoring conventions are in place?  What uniformity of "content models" (this is shaped by content owners - e.g. simply health) and APIs (as published by product owners, i.e. Contentful) are available across headless CMSs?
1. For authoring components, a smaller number of highly configurable authoring components could be built. E.g.s individual components with conditional CMS selector, e.g. "Text [Kentico/ Contentful/ S3]", "Image [Kentico/ Contentful/ S3]". This would mean fewer authoring components for authors to use but less intuitive and more complex configuration.  Greater complexity in development effort and potentially harder to test/ maintain/ extend.     
1. Another (preferable) approach is configurable individual component groups - one OSGi bundle per CMS api - e.g. ["Kentico Text", "Kentico Image"...] and ["Contentful Text", "Contentful Image"...].  Configuration is done once per component group = more intuitive authoring config, better UI and code 'encapsulation' and 'coherence'.
1. Selection of available items is presented inside component.  E.g. all text items published on Kentico are shown to authors to pick from when adding text from Kentico.  This is a challenge both in terms of app performance (network latency etc) and authoring GUI; e.g. how to present an author with several hundred content items to chose from? "Teasers" of content items?

Service code (backing components): 'adapter' and 'manager + providers' patterns
1.  `Manager#shouldFetch` // e.g. simple type test allows manager code to be written once in core code. New headless CMSs to be added and register themselves on-the-fly (Open-Closed principle).
1. Individual headless CMS AEM service "Adapters" provide interface implementations, e.g. `TextContent#fetchAll()`, `ImageContent#fetch(${id})`
1. Individual headless CMS AEM service bundles are configured with
    * location (i.e. URL)
    * authorisation and authentication credentials (e.g. project id, access tokens)

### Page compilation in author and publisher instances
* Author sees page structure with static content values.  Conditional logic supports fetching of actual content from CMS for preview
* Published / activated + replicated pages are rendered and cached via AEM dispatcher (+ e.g. Apache)

###  AEM dispatcher caching (e.g. understanding external content changes)
1. Cache invalidation
  * headless content should be pulled into aem, rendered and cached by the server.  So, updates to headless CMS must notify, e.g.s
    1. PUSH TO AEM a web hook exposed from AEM is configured as the 'web hook' in headless CMS
      * Following notification of changes in published headless content, AEM must find changed pages that include that content.  How to query CRX?  
          * XQuery
          * Custom approach extending or copying AEM broken link finder...
    1. PULL FROM HEADLESS poll for content changes - compare changes against stored metadata of published content stored in CRX and flush/ invalidate cache for those.

#### Initial investigations
1. What is the preferred strategy? - this influences particularly the caching and performance of content delivery.
   1. poll content from headless CMS; store it in AEM's CRX.
       * PROs E.g. as scheduled batch operations.  Gets benefit of AEM to manage content.  Solves cache invalidation issue.  Could be more performant by only syncing only changes.
       * CONs duplicates content and duplicates content management effort.  Content may be out of date - though content 'sync' could be manual as well as automateic.
   1. pull referenced data into pages built by AEM - server side - render those pages server side and cache in dispatcher.
   1. 'configure' pages in AEM and pull content directly to browser - skipping server side render and making headless provider do caching etc.  With Contentful this is by default anyway given their content is served via CDN.

#### Development considerations
1. Examine the number of content providers (headless CMSs) and uniformity across APIs: similar structures within each CMSs content models should help achievability.
E.g.s
Kentico (provide your own content types, built from 'text', 'richtext', 'number', 'date', 'multiple choice' etc)
> https://deliver.kenticocloud.com/615bf5da-4720-450f-813f-ac824dcb831f/items/see_your_doctor_blog__with_image_
> https://deliver.kenticocloud.com/615bf5da-4720-450f-813f-ac824dcb831f/items/see_your_doctor_blog__with_image_

1. Identify common implementations, models, api interaction with headless CMSs - to find suitable coding abstractions.
    1. An external CMS component configurator.
        1. specify location
        1. connection credentials
    2. External content - or additional properties added to (extended) existing components
        1. select source
        1. select type
1. Connectors
1. Access control and security restrictions
1. PUSH notifications
1. PUB-SUB events

#### Implementation notes
##### Kentico
* json response, curl https://deliver.kenticocloud.com/615bf5da-4720-450f-813f-ac824dcb831f/items/first_article
```json
{
  "item": {
    "system": {
      "id": "abf466de-c071-4ee3-80db-e14d5ab314b4",
      "name": "First article",
      "codename": "first_article",
      "language": "default",
      "type": "article",
      "sitemap_locations": [],
      "last_modified": "2017-10-15T21:29:48.0865295Z"
    },
    "elements": {
      "article_entry": {
        "type": "rich_text",
        "name": "Article entry",
        "images": {},
        "links": {},
        "modular_content": [],
        "value": "<h1>First Kentico article heading</h1>\n<h2>Take lots of exercise</h2>\n<p>\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi <strong>...THIS TEXT IS COMING FROM KENTICO...</strong> ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\"</p>"
      }
    }
  },
  "modular_content": {}
```
> https://app.kenticocloud.com/
<?xml version="1.0" encoding="UTF-8"?> <jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0" jcr:description="Page Template" jcr:primaryType="cq:Template" jcr:title="Page Template" allowedPaths="[/content/site/en(/.*)?]" ranking="{Long}100"> <jcr:content jcr:primaryType="cq:PageContent" sling:resourceType="site/components/page/interior" cq:designPath="/etc/designs/site"> <text jcr:primaryType="nt:unstructured" sling:resourceType="wcm/foundation/components/text" /> </jcr:content> </jcr:root>

> developer docs https://developer.kenticocloud.com/reference

> project id - 615bf5da-4720-450f-813f-ac824dcb831f

>  Retrieve published content from your project using the production URL:
https://deliver.kenticocloud.com/

> e.g. https://deliver.kenticocloud.com/615bf5da-4720-450f-813f-ac824dcb831f/items

###### Delivery API

The Kentico Cloud Delivery API is read-only. You can retrieve content but not add or modify it.

Production vs Preview: You can work with the Delivery API in two ways. Either retrieve published versions of content items or preview their yet unpublished versions. In both cases, you use the same methods to request data but with a different base URL.

   1. published content can't be edited - copy, amend and publish a new version
   1. To access content: 'Delivery API' provides anonymous read-only access to all PUBLISHED content.  To view unpublished requires authorization header in requests
   1. Items
     *  https://deliver.kenticocloud.com/615bf5da-4720-450f-813f-ac824dcb831f/items/first_article
     *  https://deliver.kenticocloud.com/615bf5da-4720-450f-813f-ac824dcb831f/items/second_article


##### Contentful
* json response, curl https://cdn.contentful.com/spaces/zfl4wimxkkv9/entries/6SvVjrV7R6OWS6CCaSSY6A?access_token=483b0333aea5eecf15a72256d6e65c8f02af618fc490d34a58033ac01f6476a8
```json
{
  "sys": {
    "space": {
      "sys": {
        "type": "Link",
        "linkType": "Space",
        "id": "zfl4wimxkkv9"
      }
    },
    "id": "6SvVjrV7R6OWS6CCaSSY6A",
    "type": "Entry",
    "createdAt": "2017-10-12T22:18:11.769Z",
    "updatedAt": "2017-10-12T22:18:11.769Z",
    "revision": 1,
    "contentType": {
      "sys": {
        "type": "Link",
        "linkType": "ContentType",
        "id": "article"
      }
    },
    "locale": "en-GB"
  },
  "fields": {
    "articleHeading": "Contentful article 2",
    "articleMain": "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc."
  }
}
```

> developer docs: https://www.contentful.com/developers/docs/concepts/webhooks/

> Space Id: zfl4wimxkkv9

> Content delivery api access token: 483b0333aea5eecf15a72256d6e65c8f02af618fc490d34a58033ac01f6476a8

> Content preview api - access token: b3271ed6a14847f7056f9ea8062619669ca069555321bd2a27aa8e05705747dd

Contentful
1. e.g. curl https://cdn.contentful.com/spaces/zfl4wimxkkv9/entries/6SvVjrV7R6OWS6CCaSSY6A?access_token=b3271ed6a14847f7056f9ea8062619669ca069555321bd2a27aa8e05705747dd

### Challenges
* Not using the DAM - so missing those benefits, e.g. automatic image renditions
* Cache performance
* Keeping published content in sync
* Limited use of AEM CRX and AEM CMS
* Mixed CMS approaches across Headless CMSs
