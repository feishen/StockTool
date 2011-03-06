var stocklib = require('./stocksynlib.js');

var queryParam = stocklib.createQueryHistParam('600011.SS', stocklib.HistQuotesInterval.Daily, 2011, 1, 1);
stocklib.queryStockHistory(queryParam);

