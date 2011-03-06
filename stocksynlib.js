var http = require('http');

var URL_HOST = 'ichart.yahoo.com';
var URL_QUERY_HIST_PATH_PREFIX = '/table.csv?s=';
var URL_QUERY_HIST_PATH_POSTFIX = '&ignore=.csv';

var HistQuotesInterval = {
	Daily: 'd',
	Weekly: 'w',
	Monthly: 'm',
	isValid: function(value) {
	            return (value == 'd' || value == 'w' || value == 'm');
	         }
};

/**
 *  function:   queryStockHistory
 *  return:     
 */
var queryStockHistory = function (/*QueryHistParam*/ param, /*function(statusCode, histValues)*/ callback) {
    var httpReqOption = createQueryHistURL(param);
    
    http.get(httpReqOption, function(res) {
        var resContent = '';
        var status = res.statusCode;
        if (status == 200) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                resContent += chunk;
            });
            res.on('end', function () {
                var stockHistValues = mapCSV2HistValues(resContent);
                if (callback) {
                    callback(status, stockHistValues);
                } else {
                    console.log(stockHistValues);
                }
            });
        } else {
            if (callback) {
                callback(status, null);
            } else {
                console.log(status);
            }
        }
    });
}

/**
 *  function:   createQueryHistParam
 *  return:     QueryHistParam
 */
var createQueryHistParam = function(
				/*string*/ stockId, /*HistQuotesInterval*/ interval,
				/*int*/ fromYear, /*int*/ fromMonth, /*int*/ fromDay, 
				/*int*/ toYear, /*int*/ toMonth, /*int*/ toDay
				) {
	interval = interval || HistQuotesInterval.Daily;
	
	if (fromYear == null && fromMonth == null && fromDay == null) {
        var d = new Date();
        fromYear = d.getFullYear();
        fromMonth = d.getMonth();
        fromDay = d.getDate();
    } else {
	    fromYear = parseInt(fromYear);
	    fromMonth = parseInt(fromMonth) - 1;
	    fromDay = parseInt(fromDay);   
    }
    if (toYear == null && toMonth == null && toDay == null) {
        var d = new Date();
        toYear = d.getFullYear();
        toMonth = d.getMonth();
        toDay = d.getDate();
    } else {
        toYear = parseInt(toYear);
	    toMonth = parseInt(toMonth) - 1;
	    toDay = parseInt(toDay);
    }
    
    var queryHistParam = {
	        stockId: stockId,
	        interval: interval,
	        fromYear: fromYear,
	        fromMonth: fromMonth,
	        fromDay: fromDay,
	        toYear: toYear,
	        toMonth: toMonth,
	        toDay: toDay
	        }

    validateQueryHistParam(queryHistParam);
    
    return queryHistParam;
};


/**
 *  function:   createQueryHistURL
 *  return:     http request option
 */
var createQueryHistURL = function (/*QueryHistParam*/ param) {
    validateQueryHistParam(param);
    
    var path = URL_QUERY_HIST_PATH_PREFIX
                 + param.stockId
                 + '&a=' + param.fromMonth + '&b=' + param.fromDay + '&c=' + param.fromYear
                 + '&d=' + param.toMonth + '&e=' + param.toDay + '&f=' + param.toYear
                 + '&g=' + param.interval
                 + URL_QUERY_HIST_PATH_POSTFIX;
    
    var httpReqOption = {
        host: URL_HOST,
        port: 80,
        path: path
    }
    return httpReqOption;
}

var mapCSV2HistValues = function(/*string*/ content) {
    var values = new Array();
    if (content) {
        var rows = content.split("\n");
        for (var i = 1; i < rows.length; i++) {
            var row = rows[i];
            var cols = row.split(',');
            if (cols.length == 7) {
                var value = {
                    date: cols[0],
                    open: parseFloat(cols[1]),
                    high: parseFloat(cols[2]),
                    low: parseFloat(cols[3]),
                    close: parseFloat(cols[4]),
                    volume: parseFloat(cols[5]),
                    adjClose: parseFloat(cols[6])
                };
                values.push(value);
            }
        }
    }
    return values;
}

var validateQueryHistParam = function (/*QueryParam*/ param) {
    if (param == null) {
        throw new Error("The param is null.");
    }
    var stockId = param.stockId;
    var interval = param.interval;
    var fromYear = param.fromYear;
    var fromMonth = param.fromMonth;
    var fromDay = param.fromDay;
    var toYear = param.toYear;
    var toMonth = param.toMonth;
    var toDay = param.toDay;
    
    checkArg('Stock id', stockId, (stockId != null && stockId.length > 0));
	checkArg('interval', interval, HistQuotesInterval.isValid(interval));
    checkArg('fromYear', fromYear, (fromYear != null && !isNaN(fromYear)));
    checkArg('fromMonth', fromMonth, (fromMonth != null && !isNaN(fromMonth) && fromMonth >= 0 && fromMonth <= 11));
    checkArg('fromDay', fromDay, (fromDay != null && !isNaN(fromDay) && fromDay >= 1 && fromDay <= 31));
    checkArg('toYear', toYear, (toYear != null && !isNaN(toYear)));
    checkArg('toMonth', toMonth, (toMonth != null && !isNaN(toMonth) && toMonth >= 0 && toMonth <= 11));
    checkArg('toDay', toDay, (toDay != null && !isNaN(toDay) && toDay >= 1 && toDay <= 31));
}

var checkArg = function (/*string*/ argName, /*object*/ argValue, /*boolean*/ assert) {
    if (!assert) {
        throwIllegalArgError(argName, argValue);
    }
}

var throwIllegalArgError = function (/*string*/ argName, /*object*/ argValue) {
	throw new Error("Invalid argument value [" + argValue + "] for " + argName);
}


exports.HistQuotesInterval = HistQuotesInterval;
exports.createQueryHistParam = createQueryHistParam;
exports.createQueryHistURL = createQueryHistURL;
exports.queryStockHistory = queryStockHistory;

