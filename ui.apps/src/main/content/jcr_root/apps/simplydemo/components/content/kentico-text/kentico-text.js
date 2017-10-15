"use strict";

use(['../utils/ajax-utils.js'], function (AjaxUtils) {

	var link = properties.get('link')

    if(wcmmode.disabled || wcmmode.preview) {
        AjaxUtils.fetchHeadlessContent('kentico', link);
    } 

    return {
        link: link
	};

});
