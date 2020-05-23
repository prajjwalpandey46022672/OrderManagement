public with sharing class OrderSummary {
    public OrderSummary() {

    }

// to get the acocount details for summary
    @AuraEnabled
    public static list<Order> getAccountDetails(String createdOrderId){
        system.debug(createdOrderId);
        list<Order> accOrdList= new list<Order>([Select OrderNumber,TotalAmount,AccountId 
                                                    from Order where Id=:createdOrderId ]);
        system.debug('the details off accrdDetails');
        system.debug(accOrdList);
        return accOrdList;
    }
//to confirm and cancel the order
    @AuraEnabled
    public static list<Order> updateOrderDetails(String createdOrderId){
        system.debug(createdOrderId);
        //update the stage to cancelled
        list<Order> accOrdList= new list<Order>([Select Id, Stage__c, Order_Remarks__c from Order where Id=:createdOrderId limit 1]);
        accOrdList[0].Stage__c = 'Cancelled';
        accOrdList[0].Order_Remarks__c = 'Cancelled before Confirmation';
                
        update accOrdList;
        system.debug(accOrdList);
        return accOrdList;
    }

}