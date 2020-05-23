trigger twosalesuser on User (before insert) {

    
    if(trigger.isBefore && trigger.isInsert){
        list<User> mangerid = [select id from User where managerId =: trigger.new[0].managerId];
        if(mangerid.size()>=2){
            trigger.new[0].addError('You cannot assign this manager limit exceeded');
        }        
    }

}