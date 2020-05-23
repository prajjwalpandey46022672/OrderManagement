trigger StageChangeRestrict on Order (before insert,after insert, before update, after update) {
    if(trigger.isBefore&&trigger.isUpdate) 
    {
        list<Order> ordlist=new list<order>();
       for(Order o:trigger.new)
       {
       if(o.Stage__c!=trigger.oldMap.get(o.Id).Stage__c)
       {
           if(trigger.oldMap.get(o.Id).Stage__c=='Cancelled'|| trigger.oldMap.get(o.Id).Stage__c == 'Delivered')
           {
               o.addError('Stage cannot be changed after Delivery or Cancellation');
           }
           if(trigger.oldMap.get(o.Id).Stage__c == 'Delivery in Plan'){
               if(o.Stage__c == 'Created' || o.Stage__c == 'In process'||o.Stage__c == 'Invoice Generated'||o.Stage__c == 'Payment Received'){
                   o.addError('Cannot revert Stage');
               }
           }
           else if (trigger.oldmap.get(o.Id).Stage__c == 'Payment Received'){
                        if(o.Stage__c == 'Created' || o.Stage__c == 'In process'||o.Stage__c == 'Invoice Generated'){
                            o.addError('Cannot revert Stage');
                        }
                    }
            else if (trigger.oldmap.get(o.Id).Stage__c == 'Invoice Generated'){
                        if(o.Stage__c == 'Created' || o.Stage__c == 'In process'){
                            o.addError('Cannot revert Stage');
                        }
                    }
            else if (trigger.oldmap.get(o.Id).Stage__c == 'In process'){
                        if(o.Stage__c == 'Created'){
                            o.addError('Cannot revert Stage');
                        }
                    }
           
           
       }
       }
     
    }
}