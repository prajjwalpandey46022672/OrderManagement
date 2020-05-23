import { LightningElement ,api, wire, track} from 'lwc';
import findAllProducts from '@salesforce/apex/EditOrderController.findAllProducts';
import findOrderAndProducts from '@salesforce/apex/EditOrderController.findOrderAndProducts';
import updateOrderFinal from '@salesforce/apex/EditOrderController.updateOrderFinal';
import { NavigationMixin } from 'lightning/navigation';
import backgroundUrl from '@salesforce/resourceUrl/Photo3'



export default class EditNew extends NavigationMixin(LightningElement) {
    @api record;
    @api newOrderSummary;
    
    modeToggle=true;editModeToggle=false;
    tableToggle=true;addItemToggle=false;
    
    showSearchList=false;
    searchProductList;priceBookId;
    order;productList=[];toDeleteList=[];
    //as soon as component is loaded lifecyclehook
    connectedCallback(){
        //record id fed in aura component
        findOrderAndProducts({orderId:this.record})
        .then(result=>{
            //adding the order details into order
            this.order=result[0];
            this.priceBookId=this.order.Pricebook2Id;
            for(var product of this.order.OrderItems){
                var selectedproduct=new Object();
                selectedproduct.OrderItemId=product.Id;
                selectedproduct.PricebookEntryId=product.PricebookEntryId;
                selectedproduct.ProductId=product.PricebookEntry.Product2Id;
                selectedproduct.Name=product.PricebookEntry.Product2.Name;
                selectedproduct.ProductCode=product.PricebookEntry.Product2.ProductCode;
                selectedproduct.Brand=product.PricebookEntry.Product2.Brand__c;
                selectedproduct.Stock_Quantity=product.PricebookEntry.Product2.StockQuantity__c;
                selectedproduct.Quantity=product.Quantity;
                selectedproduct.Discount=product.Discount__c;
                selectedproduct.ListPrice=product.ListPrice;
                selectedproduct.UnitPrice=product.UnitPrice;
                this.productList.push(selectedproduct);
            }
        });
    }
    //Display save and cancel button
    editMode(){
        this.modeToggle=false;
    }
    //display product search bar
    addItemClick(){
        this.addItemToggle=true;
    }
    closeModalTab(){
        this.addItemToggle=false;
    }
    //Search Products in searchProductList
    handleSearch(event){
        if(event.target.value.length!=0){
            //find products based on search key
            findAllProducts({priceBookId:this.priceBookId,searchVal:event.target.value})
            .then(result=>{
                this.searchProductList=result;
            });
            this.showSearchList=true;
        }
        if(event.target.value.length==0){
            this.showSearchList=false;
        }
    }
    //add selected product to the productList
    addNewProduct(event){
        var newProduct=event.target.value;
        var selectedproduct=new Object();
        for(var product of this.searchProductList){
            if(newProduct.Id == product.Id){
                selectedproduct.Product2Id=product.Product2Id;
                selectedproduct.Name=product.Product2.Name;
                selectedproduct.ProductCode=product.Product2.ProductCode;
                selectedproduct.Brand=product.Product2.Brand__c;
                selectedproduct.Stock_Quantity=product.Product2.StockQuantity__c;
                selectedproduct.Quantity=1;
                selectedproduct.UnitPrice=0;
                selectedproduct.ListPrice=product.UnitPrice;
                selectedproduct.Discount=0;
                selectedproduct.PriceBookEntryId=product.Id;
                break;
            }
        }
        if(!this.productList.some(item => item.ProductCode === selectedproduct.ProductCode)){
            this.productList.push(selectedproduct);
        }
        this.closeModalTab();
    }
    //to remove product from the productList
    deleteClicked(event){
        var index = -1;
        for(var product of this.productList){
            index++;
            if(event.target.name==product.ProductCode){
                break;
            }
        }
        if(this.productList[index].OrderItemId != undefined){
            this.toDeleteList.push(this.productList[index]);
        }
        console.log(this.toDeleteList);
        //remove product
        this.productList.splice(index,1);
        this.tableToggle=false;
        this.tableToggle=true;
    }
    //get the quantity value entered by user and update quantity in productList
    quantityUpdate(event){
        //not be greater than product's stock quantity
        if (event.target.value > event.target.name.Stock_Quantity) {
            event.target.setCustomValidity("Enter a valid Quantity");
        } else {
            event.target.setCustomValidity("");
        }
        var index = -1;
        for(var product of this.productList){
            index++;
            if(event.target.name.ProductCode == product.ProductCode){
                break;
            }
        }
        this.productList[index].Quantity=event.target.value;
        event.target.reportValidity();
    }
    get backgroundStyle() {
        return `background-size:cover;background-repeat:no-repeat;background-image:url(${backgroundUrl})`;
    }
    //get the discount entered by the user and update in the product list
    discountUpdate(event){
        var index = -1;
        for(var product of this.productList){
            index++;
            if(event.target.name.ProductCode == product.ProductCode){
                break;
            }
        }
        this.productList[index].Discount=event.target.value;
    }
    //save the changes to the order
    saveClickedFinal(){
        for(var product of this.productList){
            product.UnitPrice=product.ListPrice - (product.ListPrice * product.Discount / 100);
        }
        //passed values to be deleted and updated product List and record Id
        updateOrderFinal({products:JSON.stringify(this.productList),toDeleteList:JSON.stringify(this.toDeleteList),orderId:this.record})
        .then(result=>{if(!this.newOrderSummary){eval("$A.get('e.force:refreshView').fire();");}})
        .catch(error=>{alert('Error : ' + JSON.stringify(error))});
    }
    cancelEditClicked(){
        eval("$A.get('e.force:refreshView').fire();");
    }
}