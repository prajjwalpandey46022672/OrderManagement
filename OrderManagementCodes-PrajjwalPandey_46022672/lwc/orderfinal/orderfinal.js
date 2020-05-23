import { LightningElement,track } from 'lwc';
import getProductForOrder from '@salesforce/apex/OrderControllerNew.getProductForOrder'; 
import getRecordId from '@salesforce/apex/OrderControllerNew.getRecordId';
import addOrderProducts from '@salesforce/apex/OrderControllerNew.addOrderProducts';
import getAccountDetails from '@salesforce/apex/OrderSummary.getAccountDetails';
import updateOrderDetails from '@salesforce/apex/OrderSummary.updateOrderDetails';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import backgroundUrl from '@salesforce/resourceUrl/Photo3'



export default class Orderfinal extends LightningElement {
    @track searchDomainValue='';
    showSummary=false;
    showSummaryButton=false;
    @track accountOrderDetail=[];
    selectedproductdetails;
    recordId ='';
    orderCreated = false;
    error;
    lowerLimit='';
    upperLimit='';
    searchText='';
    quanFlagList=[];
    searchVal;
    priceBookId;
    productList;
    searchDom;
    showSearchBar=false;
    showTable=false;
    selectedProductsTable = false;
    displaySearchList = false;
    searchpricetable=false;
    choosenProductsList=[];
    //Options for the radio button
    get options(){
        return[
            {label:'Product Name',value :'Product Name'},
            {label:'Brand',value: 'Brand'},
            {label:'Price',value: 'Price'}
        ];
    }
    //get record id and create order
    handleSuccess(event) {
        alert('Order Created!! Add Products By below keyword');
        this.orderCreated = true;
        if (this.orderCreated) {
            getRecordId()
                .then(result => {
                    this.recordId = result;
                    console.log(this.recordId);
                })
        }
    }
    //getting value entered to upper and lower variable
    getmin(event){
        console.log(event.target.value);
        this.lowerLimit = event.target.value;
    }
    getmax(event){
        this.upperLimit=event.target.value;
    }
    //get the value of radio button selected by the user in searchDomainValue showing tables accordingly
    finddomain(event){
        this.searchDomainValue = event.detail.value;
        console.log(this.searchDomainValue);
        if(this.searchDomainValue == 'Price'){
            this.searchpricetable=true ;
            this.showSearchBar=false;
        }
        else{
            this.showSearchBar=true;
            this.searchpricetable=false;
        }
    }
    //to search the products with giving pricebook search domain into the getProductForOrder Apex Function
    //Imperative call
    //storing value in productList
    //Showing Values got in a table 
    handleSearch(event){
        this.searchText = event.detail;
        console.log(event.target.name);
        //if price is selected
        if(event.target.name == 'sbp'){
            getProductForOrder({searchValue: '', priceBookId:'01s2x0000007nggAAA',searchDomain : this.searchDomainValue, lowlimit : this.lowerLimit, uplimit : this.upperLimit})
            .then(result =>{
                this.productList=JSON.parse(result);
                console.log(this.productList);
            });
            this.displaySearchList=true;
        }
        //if price is not selected
        else if(event.detail.length != 0){
            console.log('in testing');
            getProductForOrder({searchValue: event.target.value, priceBookId:'01s2x0000007nggAAA',searchDomain : this.searchDomainValue,lowlimit : this.lowerLimit, uplimit : this.upperLimit})
            .then(result =>{
                this.productList=JSON.parse(result);
                console.log(this.productList);
            });
            this.displaySearchList=true;
        }
        else{
            this.displaySearchList=false;
        }
    }
    //background image for static resource 
    get backgroundStyle() {
        return `background-size:cover;background-repeat:no-repeat;background-image:url(${backgroundUrl})`;
    }
    //on clicking add item button to add the product to choosenProductList
    addToRelatedProduct(event){
        console.log("in addProduct");
        var addId = event.target.value;
        this.selectedProductsTable = false;
        //new Object cration
        var selectedproductdetails =new Object();
        for(var prod of this.productList){
            if(prod.Id==addId){
                console.log('to check listprice');
                console.log(prod.ListPrice);
                selectedproductdetails.Id = prod.Id;
                selectedproductdetails.ProductCode = prod.ProductCode;
                selectedproductdetails.Name = prod.Name;
                selectedproductdetails.Brand = prod.Brand__c;
                selectedproductdetails.StockQuantity = prod.StockQuantity__c;
                selectedproductdetails.Quantity = 1;
                selectedproductdetails.Discount = 0;
                selectedproductdetails.UnitPrice=0;
                selectedproductdetails.ListPrice = prod.ListPrice;
                selectedproductdetails.PriceBookEntryId = prod.PriceBookEntryId;
                console.log('to check selectedproductdetails unit price');
                console.log(selectedproductdetails.UnitPrice);
                console.log('pricebookentry id issue');
                console.log(selectedproductdetails.PriceBookEntryId);

            }
            console.log(selectedproductdetails);
            //if not there already
            if(!this.choosenProductsList.some(item => item.Id === selectedproductdetails.Id)){
                this.choosenProductsList.push(selectedproductdetails);
                console.log(this.choosenProductsList);
            }
            this.selectedProductsTable=true;
        }
        this.showTable =false;
    }
    //enter product quantity
    findQuantity(event){
        var i= -1;
        for(var prod of this.choosenProductsList){
            i++;
            if(prod.Id == event.target.name){
                break;
            }
        }
        this.choosenProductsList[i].Quantity= event.target.value;
    }
    //enter discount
    findDiscount(event){
        var i= -1;
        for(var prod of this.choosenProductsList){
            i++;
            if(prod.Id == event.target.name){
                break;
            }
        }
        this.choosenProductsList[i].Discount = event.target.value;
    }
    //remove that item from choosen products after remove is clicked
    removeItem(event){
        var i=-1;
        for(var prod of this.choosenProductsList){
            i++;
            if(prod.Id == event.target.value){
                break;

            }
        }
        this.choosenProductsList.splice(i,1);
        this.selectedProductsTable =false;
        this.selectedProductsTable = true;

    }

    insertItems(event){
               for (var prod of this.choosenProductsList) {
                var selectedproductdetails = new Object();
                //add one free product with discount 100 
                if (prod.Quantity > 10) {
                    selectedproductdetails.Id = prod.Id;
                    selectedproductdetails.Name = prod.Name;
                    selectedproductdetails.ProductCode = prod.ProductCode;
                    selectedproductdetails.Brand = prod.Brand;
                    selectedproductdetails.StockQuantity = prod.StockQuantity;
                    selectedproductdetails.Quantity = '1';
                    selectedproductdetails.ListPrice = 0;
                    selectedproductdetails.UnitPrice = 0;
                    selectedproductdetails.Discount = 100;
                    selectedproductdetails.PriceBookEntryId = prod.PriceBookEntryId;
                    this.choosenProductsList.push(selectedproductdetails);
                }
                if(prod.Discount>=0 && prod.Discount <= 100){
                    prod.UnitPrice = prod.ListPrice - (prod.ListPrice * prod.Discount / 100);
                }
                else{
                    prod.UnitPrice = prod.ListPrice;
                }
                
            }
            //send the chosenProductsList in Json format as argument and passing the recordId Of order created
            addOrderProducts({ selectedProducts: JSON.stringify(this.choosenProductsList), priceBookId:'01s2x0000007nggAAA', ordId: this.recordId })
            .then(result => {
                console.log('Order Id : ' + result);
            })
            .catch(error => {
                console.log(error);
            });
            //show summary table
            this.showTable = false;
            this.selectedProductsTable =false;
            this.showSummaryButton =true;

    }
    //to clear the search text value            
    clearSearch(event){
        this.searchText='';
    }
    //display summary of order products selected
    displaySummary(event){
        this.showSummary =true;
        //account details and amount 
     getAccountDetails({createdOrderId : this.recordId})
    .then(result => { 
        this.accountOrderDetail = result;
       
    })
    .catch(error => {
        console.log(error);
    });

    this.displaySearchList =false;
    this.showSearchBar =false;
    }
    //confirm order
    handleConfirm(event){
       
        console.log(this.recordId);

        const event1 = new ShowToastEvent({
            title: 'Order Created',
            message: 'Order Has Been Successfully Created',
        });
        this.dispatchEvent(event1);
        location.reload();
    }
    // cancel the order
    handleCancel(event){
        console.log(this.recordId);
  
        //update stage to cancelled
        updateOrderDetails({createdOrderId : this.recordId})
        .then(result => { 
            this.accountOrderDetail = result;
            console.log(this.accountOrderDetail);
        })
        .catch(error => {
            console.log(error);
        });

        console.log(this.recordId);
        const event2 = new ShowToastEvent({
            title: 'Order Cancelled',
            message: 'Order Has Been Cancelled',
        });
        this.dispatchEvent(event2);
        location.reload();
    }

}