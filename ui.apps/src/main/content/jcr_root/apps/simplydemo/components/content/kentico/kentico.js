"use strict";

use(['../utils/ajax-utils.js'], function (AjaxUtils) {

	var link = properties.get('kenticoLink'),
        value;

    if(wcmmode.disabled || wcmmode.preview) {
        value = AjaxUtils.fetchHeadlessContent('kentico', link);
    } 

    return {
        link: link,
        value: value
	};

});
