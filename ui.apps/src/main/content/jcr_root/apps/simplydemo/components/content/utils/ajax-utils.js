"use strict";

use(function () {

    var AjaxUtils = {};
    var httpRequest;

    AjaxUtils.fetchHeadlessContent = function (t, item) {
        if(t === "kentico") {
			return fetchKentico(item);
        }

        if(t === "contentful") {
			return fetchContentful(item);
        }
    }

    function parseKenticoValue(s) {
        log.debug("in parseKenticoValue ");
        if (s) log.debug("input stream string? " + s);
    }

    function fetch(url) {
		var	getRequest = new org.apache.commons.httpclient.methods.GetMethod(url),
            client = new org.apache.commons.httpclient.HttpClient(),
            status = new org.apache.commons.httpclient.HttpStatus(),
            response;
        console.log("Retrieving data from " + url)
        try {
            var statusCode = client.executeMethod(getRequest)
            log.debug("fetch response code ? " + statusCode)
            if (statusCode == status.SC_OK) {
                log.debug("in here...")
                response = getRequest.getResponseBodyAsString()
                log.debug("Retrieved Data")
            } else {
                log.error("Failed to execute http method")
            }
        } catch (e) {
            log.error(e)
        } finally {
            log.debug("Finished")
        }
        return response
    }

    function fetchKentico(item){
        if(item) {
			log.debug("try fetch " + item + " from kentico cloud")
            var response = fetch("https://deliver.kenticocloud.com/615bf5da-4720-450f-813f-ac824dcb831f/items/" + item)
            log.debug("client response? " + response);
        }
    }

    function fetchContentful(item){}


    return AjaxUtils
});
