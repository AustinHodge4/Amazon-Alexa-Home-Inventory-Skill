const aws = require('aws-sdk');
const Alexa = require('alexa-sdk');
const mysql = require('mysql');

// Database Object
var con;

const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).
const languageStrings = {
    'en': {
        translation: {
            SKILL_NAME: 'Home Inventory',
            HELP_MESSAGE: 'You can say Start Home Inventory then Update or Ask Home Inventory to Add an item that cost a number of dollars',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
        },
    },
    'en-US': {
        translation: {
            SKILL_NAME: 'Home Inventory',
        },
    },
};

const handlers = {
    'LaunchRequest': function () {
        con = mysql.createConnection({
            host: "nwhomeinv.cuch1fod8iti.us-east-1.rds.amazonaws.com",
            user:"admin",
            password: "masterpass",
            database: "HomeInv"
        });
        this.emit(':delegate', this.event.request.intent);
    },
    'AddItemToHomeInventory' : function() {
        var res;
        var INVENTORY_ITEM = this.event.request.intent.slots.INVENTORY_ITEM.value;
        var COST = this.event.request.intent.slots.COST.value;
        
        if(con == undefined){
            con = mysql.createConnection({
                host: "nwhomeinv.cuch1fod8iti.us-east-1.rds.amazonaws.com",
                user:"admin",
                password: "masterpass",
                database: "HomeInv"
            });
        }
        con.connect(function(err){
            if(err) {
                console.log("Cannot connect to Database!!");
                console.log(err.stack);
                res = "?";
            }else{ 
                console.log("Connected to Database!");
            
                var sql = 'INSERT INTO Inventory (Item_Desc, Price, Date_Added) VALUES (\''+INVENTORY_ITEM+'\', '+COST+', CURDATE())';
                con.query(sql, function (err, result) {
                        if (err) throw err;

                        console.log(result);
                        res = result;
                }); 
            }
        }); 
        // Wait until queries are done
        while(res == undefined) {require('deasync').sleep(100);}
        console.log("...Ending Database Connection...");
        con.end();
        
        this.emit(':tell', 'I added ' + INVENTORY_ITEM + ' to the inventory, smiley face. Response by Nationwide.');
    },
    'AddItemToHomeInventoryDialog' : function() {
        
        var INVENTORY_ITEM = this.event.request.intent.slots.INVENTORY_ITEM.value;
        var COST = this.event.request.intent.slots.COST.value;
        var ROOM = this.event.request.intent.slots.ROOM.value;
        var MANUFACTURER = this.event.request.intent.slots.MANUFACTURER.value;
        var res;

        if(con == undefined){
            con = mysql.createConnection({
                host: "nwhomeinv.cuch1fod8iti.us-east-1.rds.amazonaws.com",
                user:"admin",
                password: "masterpass",
                database: "HomeInv"
            });
        }
        if ((INVENTORY_ITEM) && (COST) && (ROOM) && (MANUFACTURER)) {
            con.connect(function(err){
                if(err) {
                    console.log("Cannot connect to Database!!");
                    console.log(err.stack);
                    res = "?";
                }else{ 
                    console.log("Connected to Database!");
                
                    var sql = 'INSERT INTO Inventory (Item_Desc, Price, Room, Manufacturer, Date_Added) VALUES (\''+INVENTORY_ITEM+'\', '+COST+', \''+ ROOM + '\', \''+MANUFACTURER+'\', CURDATE())';
                    con.query(sql, function (err, result) {
                            if (err) throw err;

                            console.log(result);
                            res = result;
                    });
                }
            }); 
            // Wait until queries are done
            while(res == undefined) {require('deasync').sleep(100);}
            console.log("...Ending Database Connection...");
            con.end();

            this.emit(':tell', 'Great. I added ' + INVENTORY_ITEM + ' to the ' + ROOM);
        }
        else
        {
            this.emit(':delegate', this.event.request.intent);
        }
            
    },
    'RecentHomeInventory' : function() {
        if(con == undefined){
            con = mysql.createConnection({
                host: "nwhomeinv.cuch1fod8iti.us-east-1.rds.amazonaws.com",
                user:"admin",
                password: "masterpass",
                database: "HomeInv"
            });
        }
        var res;
        var message = "Your 5 most recent items are ";
        con.connect(function(err){
            if(err) {
                console.log("Cannot connect to Database!!");
                console.log(err.stack);
                res = "?";
            }else{ 
                console.log("Connected to Database!");
            
                var sql = "SELECT Item_Desc FROM Inventory ORDER BY Date_Added DESC LIMIT 5";
                con.query(sql, function (err, result) {
                        if (err) throw err;

                        console.log(result);
                        
                        for(var i = 0; i < result.length; i++){
                            if((result.length - i) == 2){
                                message += result[i].Item_Desc + ", and ";
                                continue;
                            }
                            if((result.length - i) == 1){
                                message += result[i].Item_Desc;
                                continue;
                            }
                            message += result[i].Item_Desc + ", ";
                        }
                        res = result;
                });
            }
        }); 
        // Wait until queries are done
        while(res == undefined) {require('deasync').sleep(100);}
        console.log("...Ending Database Connection...");
        con.end();
                
        this.emit(':tell', message);
    },
    'GetItemFromHomeInventory' : function() {
        var res;
        var INVENTORY_ITEM = this.event.request.intent.slots.INVENTORY_ITEM.value;
        var message = "Your " + INVENTORY_ITEM;

        if(con == undefined){
            con = mysql.createConnection({
                host: "nwhomeinv.cuch1fod8iti.us-east-1.rds.amazonaws.com",
                user:"admin",
                password: "masterpass",
                database: "HomeInv"
            });
        }
        con.connect(function(err){
            if(err) {
                console.log("Cannot connect to Database!!");
                console.log(err.stack);
                res = "?";
            }else{ 
                console.log("Connected to Database!");
            
                var sql = "SELECT * FROM Inventory WHERE Item_Desc = '" + INVENTORY_ITEM + "'";
                con.query(sql, function (err, result) {
                    if (err) throw err;

                    console.log(result);
                    message += " is in the list";
                    res = result;
                });
            }
        }); 
        // Wait until queries are done
        while(res == undefined) {require('deasync').sleep(100);}
        console.log("...Ending Database Connection...");
        con.end();
        
        this.emit(':tell', message);
    },
    'GetTotalValue': function() {
        var res;
        var message = "Your total value is ";

        if(con == undefined){
            con = mysql.createConnection({
                host: "nwhomeinv.cuch1fod8iti.us-east-1.rds.amazonaws.com",
                user:"admin",
                password: "masterpass",
                database: "HomeInv"
            });
        }
        con.connect(function(err){
            if(err) {
                console.log("Cannot connect to Database!!");
                console.log(err.stack);
                res = "?";
            }else{ 
                console.log("Connected to Database!");
            
                var sql = "SELECT SUM(Price) Amount FROM Inventory";
                con.query(sql, function (err, result) {
                    if (err) throw err;

                    console.log(result);
                    message += result[0].Amount + " Dollars or Euros";
                    res = result;
                });
            }
        }); 
        // Wait until queries are done
        while(res == undefined) {require('deasync').sleep(100);}
        console.log("...Ending Database Connection...");
        con.end();
        
        this.emit(':tell', message);
    },
    'GetCompleteHomeInventory': function() {
        var res;
        var message = "Your ";

        if(con == undefined){
            con = mysql.createConnection({
                host: "nwhomeinv.cuch1fod8iti.us-east-1.rds.amazonaws.com",
                user:"admin",
                password: "masterpass",
                database: "HomeInv"
            });
        }
        con.connect(function(err){
            if(err) {
                console.log("Cannot connect to Database!!");
                console.log(err.stack);
                res = "?";
            }else{ 
                console.log("Connected to Database!");
            
                var sql = "SELECT * FROM Inventory";
                con.query(sql, function (err, result) {
                    if (err) throw err;

                    console.log(result);
                    message += result.length + " items are ";
                    for(var i = 0; i < result.length; i++){
                        if((result.length - i) == 2){
                            message += result[i].Item_Desc + ", and ";
                            continue;
                        }
                        if((result.length - i) == 1){
                            message += result[i].Item_Desc;
                            continue;
                        }
                        message += result[i].Item_Desc + ", ";
                    }
                    res = result;
                });
            }
        }); 
        // Wait until queries are done
        while(res == undefined) {require('deasync').sleep(100);}
        console.log("...Ending Database Connection...");
        con.end();
                
        this.emit(':tell', message);
    },
    'RecentHomeInventoryCount' : function() {
        var ITEM_COUNT = this.event.request.intent.slots.ITEM_COUNT.value;
        var res;
        var message = "Your " + ITEM_COUNT + " most recent items are ";

        if(con == undefined){
            con = mysql.createConnection({
                host: "nwhomeinv.cuch1fod8iti.us-east-1.rds.amazonaws.com",
                user:"admin",
                password: "masterpass",
                database: "HomeInv"
            });
        }
        con.connect(function(err){
            if(err) {
                console.log("Cannot connect to Database!!");
                console.log(err.stack);
                res = "?";
            }else{ 
                console.log("Connected to Database!");
            
                var sql = "SELECT Item_Desc FROM Inventory ORDER BY Date_Added DESC LIMIT " + ITEM_COUNT;
                con.query(sql, function (err, result) {
                    if (err) throw err;

                    console.log(result);
                    for(var i = 0; i < result.length; i++){
                        if((result.length - i) == 2){
                            message += result[i].Item_Desc + ", and ";
                            continue;
                        }
                        if((result.length - i) == 1){
                            message += result[i].Item_Desc;
                            continue;
                        }
                        message += result[i].Item_Desc + ", ";
                    }
                    res = result;
                });
            }
        }); 

        // Wait until queries are done
        while(res == undefined) {require('deasync').sleep(100);}
        console.log("...Ending Database Connection...");
        con.end();

        this.emit(':tell', message);
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
