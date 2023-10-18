import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getBudget from '@salesforce/apex/BudgetController.getBudget';
import getBudgetCategories from '@salesforce/apex/BudgetController.getBudgetCategories';
import insertBudgetCategory from '@salesforce/apex/BudgetController.insertBudgetCategory';
import deleteBudgetCategory from '@salesforce/apex/BudgetController.deleteBudgetCategory';
import updateBudgetCategory from '@salesforce/apex/BudgetController.updateBudgetCategory';
import getExpensesByCategoryName from '@salesforce/apex/BudgetController.getExpensesByCategoryName';
import insertBudgetCategoryExpenses from '@salesforce/apex/BudgetController.insertBudgetCategoryExpenses'; 
import updateBudgetCategoryExpense from '@salesforce/apex/BudgetController.updateBudgetCategoryExpense';
import deleteBudgetCategoryExpense from '@salesforce/apex/BudgetController.deleteBudgetCategoryExpense';
import { publish, MessageContext } from 'lightning/messageService';
import { refreshApex } from '@salesforce/apex';
import BUDGET_TABLE_CHANNEL from '@salesforce/messageChannel/BUDGETTABLECHANNEL__c';

export default class BudgetTable extends LightningElement {
    @api recordId;
    @track categories;
    @track showModal = false;
    @track showEditModal = false;
    @track name;
    
    @track cost;
    @track isLoading = true;
    //@track isExpenseTableLoading = true;
    @track records = [];
    //@track budgetRecords =[];
    @track budgetSpent = 0;
    @track totalBudget = 0;
    @track availableBudget = 0;
    @track showAddCategoryDialog = false;
    @wire(MessageContext) messageContext;
    editedCategory;
    editedCategoryId;
    isEditMode = false;
    editedExpenseId;
    @track showCategoryRecords = false;
    @track selectedCategoryName;
    @track showCategoryExpenses = false;
    @track categoryExpenses = [];
    showButtonLabel = 'Show';
    @track showAddExpenseForm = false;
    @track expenseName = '';
    @track expenseResourceName = '';
    @track expenseCost = '';
    @track categoryId;
    @track budgetId;
    @track expenseId;
    @track categoriesId;
    @track categoryNameId;
    @track showEditExpenseModal = false;
    @track editedExpense = {};
    @track editedExpenseIndex;
    @track selectedCategoryId;
    @track categoryNameId;
    @track BudgetName;
    @track budget
    @track totalCategoryExpenseCost = 0;
    wiredExpensesResult;
     @wire(getExpensesByCategoryName, { categoryName: '$selectedCategoryName' , recordId: '$recordId'  })
    wiredExpenses(result) {
    this.wiredExpensesResult = result;
    if (result.data) {
        this.categoryExpenses = result.data;
        this.showCategoryRecords = true;
      
    } else if (result.error) {
        this.showToast('Error', result.error.body.message, 'error');
    }
}


refreshExpenses() {
    return refreshApex(this.wiredExpensesResult);
}

connectedCallback() {
        console.log('@@@@@@@@@@@ In Budget Table Connected call back @@@@@@@@@');
        this.getBudgetRecordInfo();
    }
getBudgetRecordInfo() {
    try {
        getBudget({ recordId: this.recordId })
            .then(result => {
                console.log('@@@@@Budget Details In budget table @@@@' +JSON.stringify(result));
                this.budgetRecord = result;
                if (result && result.length > 0) {
                    const budgetRecord = result[0];
                this.budgetSpent = budgetRecord.Budget_Spent__c;
                this.totalBudget = budgetRecord.Total_Budget__c;
                this.availableBudget = budgetRecord.Available_Budget__c;
                 console.log('@@@@@@@@ get Budget name @@@@@@@@:' , this.records);
                 this.publishRecordsUpdate();
                }
            });
        getBudgetCategories({ recordId: this.recordId })
            .then(result => {
                console.log('@@@@Budget Categories In budget table@@@@@' +JSON.stringify(result));
                this.records = result;
                this.isLoading = false;
                console.log('@@@@@@Get Budget Categories @@@@@@:' , this.records);
                this.publishRecordsUpdate();
            });
    } catch (error) {
        this.showToast('Error', error.body.message, 'error');
    }
}
   
    addExpenseForCategory(event) {
    this.expenseResourceName = '';
    this.expenseCost = '';
    this.showAddExpenseForm = true;
     }
    cancelAddExpense() {
        this.showAddExpenseForm = false;
      }
    closeExpenseTable() {
        this.showCategoryRecords = false;
      }
    addCategory() {
        this.name = '';
        this.resourcename = '';
        this.cost = '';
        this.isEditMode = false;
        this.showModal = true;
    }
   closeModal() {
        this.showModal = false;
        this.showEditModal = false;
    }
   handleInputChange(event) {
        if (event.target.name === 'name') {
            this.name = event.target.value;
        } else if (event.target.name === 'resourcename') {
            this.resourcename = event.target.value;
        } else if (event.target.name === 'cost') {
            this.cost = event.target.value;
        }
    }
     saveBudget() {
        if (!this.isEditMode) {
            const isDuplicate = this.records.some(category => category.Name === this.name);
            if (isDuplicate) {
                this.showToast('Error', 'Category name already exists , Please enter different name', 'error');
                return;
            }
              } else {
               if (this.name !== this.editedCategory.Name) {
                const isDuplicate = this.records.some(category => category.Name === this.name);
                if (isDuplicate) {
                    this.showToast('Error', 'Category name already exists.', 'error');
                    return;
                 }
              }
           }
           if (this.isEditMode) {
            updateBudgetCategory({ categoryId: this.editedCategoryId, name: this.name,  cost: this.cost })
                .then(updated => {
                    this.showToast('Success', 'Budget category updated successfully.', 'success');
                    this.closeModal();
                    this.refreshTable();
                    const messagePayload = {
                        recordId: this.recordId,
                        action: 'update',
                        categoryId: this.editedCategoryId
                    };
                    publish(this.messageContext, BUDGET_TABLE_CHANNEL, messagePayload);
                })
                .catch(error => {
                    this.showToast('Error', error.body.message, 'error');
                });
                } else {
                 const isDuplicate = this.records.some(category => category.Name === this.name);
                if (isDuplicate) {
                this.showToast('Error', 'Category name already exists.', 'error');
                return;
            }
              insertBudgetCategory({ recordId: this.recordId, name: this.name,  cost: this.cost })
                .then(insert => {
                    this.showToast('Success', 'Budget category added successfully.', 'success');
                    this.closeModal();
                    this.refreshTable();
                    const messagePayload = {
                        recordId: this.recordId,
                        action: 'insert'
                    };
                    publish(this.messageContext, BUDGET_TABLE_CHANNEL, messagePayload);
                })
                .catch(error => {
                    this.showToast('Error', error.body.message, 'error');
                });
        }
      }
      editBudgetCategory(event) {
        const categoryIndex = event.target.dataset.index;
        this.editedCategory = { ...this.records[categoryIndex] };
        this.name = this.editedCategory.Name;
         
         this.cost = this.editedCategory.Cost__c; 
         this.editedCategoryId = this.editedCategory.Id;
          this.isEditMode = true;
         this.showEditModal = true;
         }
        updateBudgetCategory(event) {
        const categoryId = this.editedCategoryId; 
        const name = this.name;
        
        const cost = this.cost;
        updateBudgetCategory({ categoryId, name, cost })
            .then((updated) => {
                this.showToast('Success', 'Budget category updated successfully.', 'success');
                this.closeModal();
                this.refreshTable();
                const messagePayload = {
                    recordId: this.recordId,
                    action: 'update',
                    categoryId : categoryId
                };
                publish(this.messageContext, BUDGET_TABLE_CHANNEL, messagePayload);
                eval("$A.get('e.force:refreshView').fire();");
                console.log('@@@@@@Budget Category published@@@@@@', messagePayload);
                console.log('@@@@@@Budget Category Updated@@@@@@', updated);
            })
            .catch((error) => {
                
                this.showToast('Error', error.body.message, 'error');
            });
      }
      

       
         
      deleteBudgetCategory(event) {
        const categoryId = event.target.dataset.id;
        deleteBudgetCategory({ categoryId })
        .then(deleted => {
          this.showToast('Success', 'Budget category deleted successfully.', 'success');
          this.refreshTable();
          const messagePayload = {
            recordId: this.recordId,
            action: 'delete',
            categoryId: categoryId
          };
          publish(this.messageContext, BUDGET_TABLE_CHANNEL, messagePayload);
          console.log('@@@@@@@@Budget Category Deleted@@@@@@@@' + deleted);
        })
        .catch(error => {
          if (error && error.body && error.body.message) {
            this.showToast('Error', error.body.message, 'error');
            console.log('Error 1' +error.body.message);
          } else {
            this.showToast('Error', 'An unknown error occurred.', 'error');
            console.log('Error 2' +error);
          }
        });
    }
    handleSaveAction() {
    this.publishRecordsUpdate();
    this.refreshTable();
   }
     openCategoryExpensesModal() {
      this.showCategoryExpenses = true;
    }
     closeCategoryExpensesModal() {
      console.log('Closing the modal');
       this.showCategoryExpenses = false; 
    }
   
    closeEditExpenseModal() {
    this.showEditExpenseModal = false;
}   
handleShowCategoryRecords(event) {
    console.log('@@@@@@Received event:@@@@@@', event);
    console.log('@@@@@@Event target:@@@@@@', event.target);
    console.log('@@@@@Data index:@@@@@', event.target.dataset.index);
 
    try {
        
        if (!event || !event.target || !event.target.dataset || !event.target.dataset.index) {
            console.error('Invalid event object:', event);
            return;
        }
       const categoryIndex = event.target.dataset.index;
       const budgetId = this.recordId;
      
        this.budgetId = budgetId;
        this.selectedCategoryName = this.records[categoryIndex].Name;
        this.selectedCategoryNameForExpenses = this.selectedCategoryName;
        this.selectedCategoryId = this.records[categoryIndex].Id;
        
        getExpensesByCategoryName({ categoryName: this.selectedCategoryName , recordId :this.budgetId})
            .then(result => {
               
                this.categoryExpenses = result;
                this.showCategoryRecords = true;
                this.isExpenseTableLoading = false;
                console.log(' @@@@@@ SelectedCategoryId:@@@@@@@' , this.selectedCategoryId);
                console.log('@@@@@@Selected Category Name:@@@@@@' ,  this.selectedCategoryName);
                console.log('@@@@Category Expenses Fetched Successfully@@@@@' , this.categoryExpenses);
                console.log('@@@Expenses Table@@' +JSON.stringify(result));
                this.showToast('Success', `Category Name '${this.selectedCategoryName}' fetched successfully.`, 'success');
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    } catch (error) {
        console.error('Error in handleShowCategoryRecords:', error);
    }
}
    saveExpense() {
    this.showAddExpenseForm = false;
    const categoriesId = this.selectedCategoryId;
    const budgetId = this.recordId;
    this.categoriesId = categoriesId; 
    this.budgetId = budgetId;
    
    insertBudgetCategoryExpenses({
        categoriesId: this.categoriesId,
        budgetId: this.budgetId,
        expenseResourceName: this.expenseResourceName,
        expenseCost: this.expenseCost
      })
      .then(result => {
        console.log('@@@@@@@@ Expense Insert categoriesId @@@@@@ : ', this.categoriesId);
        console.log('@@@@@@@   Expense Insert budgetId @@@@@@@@: ', this.budgetId);
        console.log('@@@@@@ Entered Resource name @@@@@@@@@ '+this.expenseResourceName);
        console.log('@@@@@@ Entered Expense Cost @@@@@@' +this.expenseCost);
        console.log('@@@@@@@ Expense Insert Result @@@@@@:', result);
        this.showToast('Success', 'Budget Expenses for ' + this.selectedCategoryName + ' added successfully.', 'success');
        this.refreshExpenses();
        
      })
      .catch(error => {
        console.error('Expense Insert Error:', error);
        if (error && error.body && error.body.message) {
          this.showToast('Error', error.body.message, 'error');
        } else {
          this.showToast('Error', 'An unknown error occurred.', 'error');
        }
      });
    } 
    editExpense(event) {
        const expenseIndex = event.target.dataset.index;
        this.editedExpense = { ...this.categoryExpenses[expenseIndex] };
       this.expenseResourceName = this.editedExpense.Resource_Name__c;
       this.expenseCost = this.editedExpense.Cost__c;
       this.editedExpenseId = this.editedExpense.Id;
        this.showEditExpenseModal = true;
       }
       updateBudgetCategoryExpense(){
        const expenseId = this.editedExpenseId;
        const expenseResourceName = this.expenseResourceName;
        const expenseCost = this.expenseCost;
        updateBudgetCategoryExpense({ expenseId , expenseResourceName , expenseCost})
                    .then((updated) => {
                   this.showEditExpenseModal = false;
                    console.log('@@@@@@@@@ Entered Resource name to update @@@@@@@@@@@@ '+this.expenseResourceName);
                    console.log(' @@@@@@@@@@@@@@@Enetred Expense Cost@@@@@@@@@@@@@@@@@' +this.expenseCost);
                    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@ Updated  Result:@@@@@@@@@@@@@@@@@@', updated);
                    this.refreshExpenses();
                    this.showToast('Success', 'Expense updated successfully.', 'success');
                   })
                .catch(error => {
                this.showToast('Error', error.body.message, 'error');
                });
            }
    handleDeleteExpense(event) {
    const expenseIndex = event.target.dataset.index;
    const expenseId = this.categoryExpenses[expenseIndex].Id;
    deleteBudgetCategoryExpense({ expenseId })
    .then(() => {
        this.categoryExpenses.splice(expenseIndex, 1);
        })
        .catch(error => {
    });
  }
deleteExpense(event) {
  const expenseId = event.target.dataset.id; 
  deleteBudgetCategoryExpense({ expenseId })
      .then(() => {
        this.categoryExpenses = this.categoryExpenses.filter(expense => expense.Id !== expenseId);
        this.showToast('Success', 'Expense deleted successfully.', 'success');
        this.refreshExpenses();
      })
      .catch(error => {
        this.showToast('Error', error.body.message, 'error');
      });
   }
  
handleExpenseInputChange(event) {
    if (event.target.name === 'expenseResourceName') {
       this.expenseResourceName = event.target.value;
   } else if (event.target.name === 'expenseCost') {
       this.expenseCost = event.target.value;
   }
}
  publishRecordsUpdate() {
  const payload = {
      recordId: this.recordId,
      categories: this.records ,
      budgets:this.budgetRecord
  };
  console.log('@@@@@@@@@@@@ Publishing message in the budget table @@@@@@@@@@@@@@@:', new Date().toLocaleTimeString()); 
  publish(this.messageContext, BUDGET_TABLE_CHANNEL, payload);
  console.log('@@@@@@@@@@@@@@@@@@ Published message @@@@@@@@@@@@@@@@@@@@: ', JSON.stringify(payload));
  console.log('@@@@@@@@@@@@@@@@@ Published message time@@@@@@@@@@@@@@@@@', new Date().toLocaleTimeString()); 
}
    refreshTable() {
        this.isLoading = true;
        this.getBudgetRecordInfo();
       
     }
    
showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }
}