"use strict";

use(['../utils/ajax-utils.js'], function (AjaxUtils) {

	var link = properties.get('contentfulLink'),
        value;

    if(wcmmode.disabled || wcmmode.preview) {
        value = AjaxUtils.fetchHeadlessContent('contentful', link);
    } 

    return {
        link: link,
        value: value
	};

});
