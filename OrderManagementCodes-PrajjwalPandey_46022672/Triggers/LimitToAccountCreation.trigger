trigger LimitToAccountCreation on Account (before insert,before update) {
    if(trigger.isBefore && (trigger.isInsert||trigger.isUpdate)){
    list<Account> AllAccounts=new list<Account>();
        for(Account acc:trigger.new){
            AllAccounts=[select id from account where ownerId=:userinfo.getUserId()];
            if(AllAccounts.size()>=5){
                acc.addError('You can only manage 5 accounts');
            }
        }
    }
}