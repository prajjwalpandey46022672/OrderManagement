public with sharing class EditOrderController {
    public EditOrderController() {

    }



    class ProductDetail{
        public String OrderItemId;
        public String PricebookEntryId;
        public String ProductId;
        public String Discount;
        public String Quantity;
        public String UnitPrice;
    }
    //list of pricebooks
    @AuraEnabled(cacheable=true)
    public static list<Pricebook2> getPriceBooks(){
        return [select Id,Name from Pricebook2];
    }
    //list of accounts
    @AuraEnabled(cacheable=true)
    public static list<Account> getAccounts(){
        return [select Id,Name from Account];
    }
    //get Products for search
    @AuraEnabled
    public static list<PriceBookEntry> findAllProducts(String priceBookId,String searchVal){
        return [select Id,Product2.Id,Product2.Name,Product2.ProductCode,Product2.Brand__c,Product2.StockQuantity__c,UnitPrice from PriceBookEntry where Pricebook2Id=:priceBookId AND Product2.Name LIKE :'%'+searchVal+'%'];
    }
    //get the order details
    @AuraEnabled
    public static list<Order> findOrderAndProducts(String orderId){
        return [select Id,EffectiveDate,Stage__c,PriceBook2.Id,OrderNumber,TotalAmount,Account.Name,(select Id,PriceBookEntryId,PriceBookEntry.Product2Id,PriceBookEntry.Product2.Name,PriceBookEntry.Product2.ProductCode,PriceBookEntry.Product2.Brand__c,PriceBookEntry.Product2.StockQuantity__c,UnitPrice,ListPrice,Quantity,Discount__c from OrderItems) from Order where Id =:orderId];
    }
    //dml to update and delete product values in order
    @AuraEnabled
    public static String updateOrderFinal(String products, String toDeleteList, String orderId){
        list<ProductDetail> productList=new list<ProductDetail>();
        JSONParser parser = JSON.createParser(products);
        while (parser.nextToken() != null) {
            if (parser.getCurrentToken() == JSONToken.START_ARRAY) {
                while (parser.nextToken() != null) {
                    if (parser.getCurrentToken() == JSONToken.START_OBJECT) {
                        ProductDetail acc = (ProductDetail)parser.readValueAs(ProductDetail.class);
                        productList.add(acc);
                    }
                }
            }
        }
        list<OrderItem> orderItemList = new list<OrderItem>();
        for(ProductDetail product:productList){
            if(product.OrderItemId==null){
                orderItemList.add(new OrderItem(OrderId=orderId,Product2Id=product.ProductId,Quantity=Decimal.valueOf(product.Quantity),UnitPrice=Decimal.valueOf(product.UnitPrice),PricebookEntryId=product.PriceBookEntryId,Discount__c=Integer.valueOf(product.Discount)));
            }
            else{
                orderItemList.add(new OrderItem(Id=product.OrderItemId,Product2Id=product.ProductId,Discount__c=Decimal.valueOf(product.Discount),Quantity=Decimal.valueOf(product.Quantity),UnitPrice=Decimal.valueOf(product.UnitPrice)));
            }
        }
        upsert orderItemList;
        productList=new list<ProductDetail>();
        parser = JSON.createParser(toDeleteList);
        while (parser.nextToken() != null) {
            if (parser.getCurrentToken() == JSONToken.START_ARRAY) {
                while (parser.nextToken() != null) {
                    if (parser.getCurrentToken() == JSONToken.START_OBJECT) {
                        ProductDetail acc = (ProductDetail)parser.readValueAs(ProductDetail.class);
                        productList.add(acc);
                    }
                }
            }
        }
        orderItemList = new list<OrderItem>();
        for(ProductDetail product:productList){
            orderItemList.add(new OrderItem(Id=product.OrderItemId));
        }
        delete orderItemList;
        return '';
    }
}

