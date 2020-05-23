public with sharing class OrderControllerNew {
    public OrderControllerNew() {

    }



    class ProductDetail{
        public String Id;
        public String Name;
        public String ProductCode;
        public String Brand;
        public String StockQuantity;
        public String Quantity;
        public String ListPrice;
        public String UnitPrice;
        public String Discount;
        public String PriceBookEntryId;
    }
    //get the record id of the order created
    @AuraEnabled
    public static string getRecordId(){
        list<Order> recId = [SELECT Id FROM Order ORDER BY CreatedDate DESC LIMIT 1];
        String rId = '' + recId[0].Id;
        return rId;
    }
    //Getting the Produts from the entered value
    @AuraEnabled
    public static String getProductForOrder(String searchValue,String priceBookId,String searchDom,String lowlimit,String uplimit){
        map<Id,Product2> productList;
        map<Id,decimal> priceSearchMap = new map<Id,decimal>();
        list<PricebookEntry> priceSearchList;
        //storing the results in productList
        if(searchDom =='Product Name'){
            productList = new map<Id,Product2>([select Id,ProductCode,Name,Brand__c,StockQuantity__c 
            from Product2 where Name LIKE :'%'+searchValue+'%']);
        }
        else if(searchDom =='Brand'){
            productList = new map<Id,Product2>([select Id,ProductCode,Name,Brand__c,StockQuantity__c 
            from Product2 where Brand__c LIKE :'%'+searchValue+'%']);
        }
        else {
            Integer ll =Integer.valueOf(lowlimit);
            Integer ul=Integer.valueOf(uplimit);
            //system.debug(searchDom);
            //system.debug(lowlimit);
            //getting products in the range of price entered by the user
            priceSearchList = [select Product2Id,UnitPrice from PricebookEntry where UnitPrice >= :ll AND UnitPrice <= :ul];
            //system.debug(priceSearchList);
           // system.debug(priceSearchList[0].Product2Id);
            for(PricebookEntry pbe : priceSearchList){
                priceSearchMap.put(pbe.Product2Id,pbe.UnitPrice);
            }
            system.debug(priceSearchMap);
            //getting the product detail for the products in priceSearchMap
            productList = new map<Id,Product2>([select Id,ProductCode,Name,Brand__c,StockQuantity__c from Product2 where Id IN : priceSearchMap.keySet()]);
            system.debug(productList);
        }
        //getting the pricebook id , product of productList for the selected pricebook
        list<PricebookEntry> priceBookEntriesList=[select Id,Product2Id,UnitPrice from PricebookEntry 
                                                   where Product2Id IN : productList.keySet() AND Pricebook2Id=:priceBookId];                                
        system.debug(productList.keySet());
        map<Id,decimal> unitPriceMap =new map<Id,decimal>();
        map<Id,String> priceBookList=new map<Id,String>();
        for(PricebookEntry pbe : priceBookEntriesList){
            unitPriceMap.put(pbe.Product2Id,pbe.UnitPrice);
            priceBookList.put(pbe.Product2Id,pbe.Id);
        }
        //return string of product list
        String str='[';
        for(Id key:productList.keySet()){
            str+='{"Id":"'+key+'",'+'"Name":"'+productList.get(key).Name+'",'+'"ProductCode":"'+productList.get(key).ProductCode+'",'+'"ListPrice":"'+unitPriceMap.get(key)+'","Quantity":"",'+'"Brand__c":"'+productList.get(key).Brand__c+'","'+'StockQuantity__c":"'+productList.get(key).StockQuantity__c+'","'+'PriceBookEntryId":"'+priceBookList.get(key)+'"}'+',';
        }
        str = str.substring(0, str.length()-1);
        str+=']';
        return str;
    }
    //add products to the table 
    @AuraEnabled
    public static string addOrderProducts(String selectedProducts,String priceBookId, String ordId){
        system.debug(priceBookId);
        system.debug('-----------------in addOrderProducts-----------------');
        list<ProductDetail> productList=new list<ProductDetail>();
        JSONParser parser = JSON.createParser(selectedProducts);
        system.debug('-------------------parser-------');
        system.debug(parser);
        while (parser.nextToken() != null) {
            if (parser.getCurrentToken() == JSONToken.START_ARRAY) {
                while (parser.nextToken() != null) {
                    if (parser.getCurrentToken() == JSONToken.START_OBJECT) {
                        ProductDetail acc = (ProductDetail)parser.readValueAs(ProductDetail.class);
                        system.debug('Id:' + acc.Id + ' Name:' + acc.Name);
                        productList.add(acc);
                    }
                }
            }
        }
        system.debug(productList);
        Order ord=[Select Stage__c,Pricebook2Id from Order where Id=:ordId];
        system.debug(ord);
        ord.Pricebook2Id = priceBookId;
        //ord.Stage__c = 'In process';
        update ord;

        list<OrderItem> orderItemList = new list<OrderItem>();
        //iterating chosen product list
        for(ProductDetail product:productList){
            orderItemList.add(new OrderItem(OrderId=ordId,Product2Id=product.Id,Quantity=Decimal.valueOf(product.Quantity),UnitPrice=Decimal.valueOf(product.UnitPrice),PricebookEntryId=product.PriceBookEntryId));
        }
        insert orderItemList;
        //products inserted
        list<Product2> prodList =new list<Product2>([select Id,StockQuantity__c from Product2]);
        Decimal temp;
        list<Id> flag = new list<Id>();
        for(ProductDetail product :productList){
            system.debug(flag);
            //to reduce product stock quantity
            for(Product2 pro : prodList){
                if(pro.Id == product.Id){
                    if(flag.indexOf(product.Id) == -1){
                        system.debug(flag.indexOf(product.Id));
                        //if quantity greater than 10
                        if(Decimal.valueOf(product.Quantity) > 10){
                            temp= Decimal.valueOf(product.StockQuantity);
                            temp-=(Decimal.valueOf(product.Quantity)+Decimal.valueOf('1'));
                            system.debug('if greaer than 10');
                            system.debug(temp);
                        }
                        else{
                            temp= Decimal.valueOf(product.StockQuantity);
                            temp-=Decimal.valueOf(product.Quantity);
                            system.debug('in less than 10');
                            system.debug(temp);
                            
                        }
                        system.debug(temp);
                        flag.add(product.Id);
                        
                    //pro.StockQuantity__c = Decimal.valueOf(product.StockQuantity) - Decimal.valueOf(product.Quantity);
                    pro.StockQuantity__c = temp;
                    }
                }
            }
        }
        update prodList;
        return 'Done Insertion Successfully';
    }
    
}