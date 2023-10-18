@isTest
public class BudgetControllerTest {
   @isTest
    static void testGetBudget() {
        
        String validRecordId = 'a018e00000inU6HAAU';
        List<Budget__c> result = BudgetController.getBudget(validRecordId);
        System.assertNotEquals(1, result.size(), 'Result should not be empty for a valid recordId');  
    }
    @isTest
        static void testGetInvalidBudget() {
         String invalidRecordId = 'a028e0000053HDYAA2'; 
        List<Budget__c> resultInvalid = BudgetController.getBudget(invalidRecordId);
        System.assertEquals(0, resultInvalid.size(), 'Result should be empty for an invalid recordId');
    }
     @isTest
    static void testGetBudgetCategories() {
      String validRecordId = 'a028e0000053HDYAA2'; 
        List<Budget_Category__c> result = BudgetController.getBudgetCategories(validRecordId);
        System.assertNotEquals(1, result.size(), 'Result should not be empty for a valid recordId');
    }
    @isTest
    static void testGetInvalidBudgetCategories() {
       String invalidRecordId = 'a018e00000inUBlAAM'; 
        List<Budget_Category__c> resultInvalid = BudgetController.getBudgetCategories(invalidRecordId);
        System.assertEquals(0, resultInvalid.size(), 'Result should be empty for an invalid recordId');
    }
        @isTest
    static void testGetExpensesByCategoryName() {
       String validCategoryName = 'Internet';
        String validRecordId = 'a018e00000inUBlAAM';
        List<Budget_Category_Expense__c> result = BudgetController.getExpensesByCategoryName(validCategoryName, validRecordId);
          List<Budget_Category_Expense__c> resultInvalidRecordId = BudgetController.getExpensesByCategoryName(validCategoryName, 'a028e0000053HDYAA2');
        System.assertNotEquals(1, result.size(), 'Result should not be empty for valid categoryName and recordId');
        System.assertEquals(0, resultInvalidRecordId.size(), 'Result should be empty for an invalid recordId');
       }
       @isTest
    static void testGetInvalidExpensesByCategoryName() {
       String invalidCategoryName = 'Kalyan';
          String validRecordId = 'a018e00000inUBlAAM';
        List<Budget_Category_Expense__c> resultInvalid = BudgetController.getExpensesByCategoryName(invalidCategoryName, validRecordId);
        System.assertEquals(0, resultInvalid.size(), 'Result should be empty for an invalid categoryName');
      }
    @isTest
    static void testInsertBudgetCategory() {
       Budget__c testBudget = new Budget__c(Total_Budget__c = 1000);
        insert testBudget;
      List<Budget_Category__c> insertedCategories = BudgetController.insertBudgetCategory(testBudget.Id, 'Test Category', 'Test Resource', 500);
   System.assertEquals(1, insertedCategories.size(), 'Category should be inserted successfully');
       
    }
   @isTest
    static void testInsertBudgetCategoryExcedingCostData() {
        Budget__c testBudget = new Budget__c(Total_Budget__c = 1000);
        insert testBudget;
        List<Budget_Category__c> insertedCategories = BudgetController.insertBudgetCategory(testBudget.Id, '', 'Test Resource', 15000);
      System.assertEquals(0, insertedCategories.size(), 'Category should not be inserted due to invalid data');
     }
    
    @isTest
    static void testInsertBudgetCategoryExpensesInvalidData() {
      Budget__c testBudget = new Budget__c(Total_Budget__c = 1000);
        insert testBudget;
      Budget_Category__c testCategory = new Budget_Category__c(Budget__c = testBudget.Id, Name = 'Test Category', Cost__c = 500);
        insert testCategory;
     List<Budget_Category_Expense__c> insertedExpenses = BudgetController.insertBudgetCategoryExpenses(testCategory.Id, testBudget.Id, 'Test Resource', 10000);
     System.assertEquals(0, insertedExpenses.size(), 'Expense should not be inserted due to invalid data');
       
    }
     @isTest
    static void testGetBudgetCategory() {
        Budget__c budget = new Budget__c();
        insert budget;
      List<Budget_category__c> categories = new List<Budget_category__c>{
            new Budget_category__c(Budget__c = budget.Id, Name = 'Category 1', Cost__c = 100),
            new Budget_category__c(Budget__c = budget.Id, Name = 'Category 2', Cost__c = 200)
        };
        insert categories;
     List<Budget_category__c> result = BudgetController.getBudgetCategories(budget.Id);
        System.assertEquals(2, result.size());
        System.assertEquals('Category 1', result[0].Name);
        System.assertEquals(100, result[0].Cost__c);
        System.assertEquals('Category 2', result[1].Name);
        System.assertEquals(200, result[1].Cost__c);
    }
     @isTest
    static void testDeleteBudgetCategory() {
       
        String validCategoryId = 'a028e0000053HECAA2'; 
        List<Budget_Category__c> result = BudgetController.deleteBudgetCategory(validCategoryId);
        System.assertNotEquals(1, result.size(), 'Result should not be empty for deleting a budget category with valid data');

        
    }
         @isTest
    static void testDeleteBudgetCategoryWithInvalidCategoryId() {
        String invalidCategoryId = 'a028e0000093HDYAA5'; 
        List<Budget_Category__c> resultInvalid = BudgetController.deleteBudgetCategory(invalidCategoryId);
        System.assertEquals(0, resultInvalid.size(), 'Result should be empty for deleting a budget category with invalid data');
    
    }
    
     @isTest
    static void testDeleteBudgetCategoryExpenseWithInvalidExpenseId() {
        String invalidExpenseId = 'a038e000008Bd0UAAS'; 
        List<Budget_Category_Expense__c> result = BudgetController.deleteBudgetCategoryExpense(invalidExpenseId);
        System.assertEquals(0, result.size(), 'Result should be empty for deleting a budget category expense with invalid data');
    }
     @isTest
    static void testInsertBudgetCategoryExpenses() {
        
        Budget__c testBudget = new Budget__c(Total_Budget__c = 1000);
        insert testBudget;

        Budget_Category__c testCategory = new Budget_Category__c(Budget__c = testBudget.Id, Name = 'Test Category', Cost__c = 500);
        insert testCategory;

        List<Budget_Category_Expense__c> insertedExpenses = BudgetController.insertBudgetCategoryExpenses(testCategory.Id, testBudget.Id, 'Test Resource', 200);

        
        System.assertEquals(1, insertedExpenses.size(), 'Expenses inserted successfully');
      
    }
    @isTest
    static void testDeleteBudgetCategoryExpenseWithInsufficientAccess() {
        String validExpenseId = 'a038e000005Bd0UAAS'; 
        
        List<Budget_Category_Expense__c> result = BudgetController.deleteBudgetCategoryExpense(validExpenseId);
        System.assertEquals(0, result.size(), 'Result should be empty for deleting a budget category expense without proper access');
    }

    @isTest
    static void testGetExpensesByCategoryNameWithZeroExpenses() {
       
        String validCategoryName = 'Internet';
        String validRecordId = 'a018e00000inUBlAAM'; 
        
        List<Budget_Category_Expense__c> result = BudgetController.getExpensesByCategoryName(validCategoryName, validRecordId);
        System.assertEquals(0, result.size(), 'Result should be empty for a category with no expenses');
    }
    
    @isTest
    static void testGetBudgetWithZeroBudgets() {
      String invalidRecordId = 'a038e000005Bd6gAAC';
       List<Budget__c> result = BudgetController.getBudget(invalidRecordId);
        System.assertEquals(0, result.size(), 'Result should be empty for getting the budget with no budgets');
    }
     @isTest
    static void testUpdateBudgetCategoryExpenseWithInvalidCost() {
       String validExpenseId = 'a038e000005Bd0UAAS'; 
        String newExpenseResourceName = 'New Resource Name';
        Decimal newExpenseCost = 50.0;
        List<Budget_Category_Expense__c> result = BudgetController.updateBudgetCategoryExpense(validExpenseId, newExpenseResourceName, newExpenseCost);
        System.assertEquals(0, result.size(), 'Result should be empty for updating a budget category expense with invalid cost');
    }
     @isTest
    static void testUpdateBudgetCategory() {
        Budget__c testBudget = new Budget__c(Total_Budget__c = 1000);
        insert testBudget;
        Budget_Category__c testCategory = new Budget_Category__c(Budget__c = testBudget.Id, Name = 'Test Category', Cost__c = 500);
        insert testCategory; 
        List<Budget_Category__c> updatedCategories = BudgetController.updateBudgetCategory(testCategory.Id, 'Updated Category',  600);
          System.assertEquals(1, updatedCategories.size(), 'Category should be updated successfully');
    }
    @isTest
    static void testUpdateBudgetCategoryExpense() {
       Budget__c testBudget = new Budget__c(Total_Budget__c = 1000);
        insert testBudget;
        Budget_Category__c testCategory = new Budget_Category__c(Budget__c = testBudget.Id, Name = 'Test Category', Cost__c = 500);
        insert testCategory;
        Budget_Category_Expense__c testExpense = new Budget_Category_Expense__c(Budget_Category__c = testCategory.Id, Budget__c = testBudget.Id, Resource_Name__c = 'Test Resource', Cost__c = 200);
        insert testExpense;
        List<Budget_Category_Expense__c> updatedExpenses = BudgetController.updateBudgetCategoryExpense(testExpense.Id, 'Updated Resource', 3000);
        System.assertEquals(1, updatedExpenses.size(), 'Expense updated successfully');
       
    }

    @isTest
    static void testGetExpensesByCategoryNameWithInvalidCategory() {
      String invalidCategoryName = 'kalyanssss'; 
         List<Budget_Category_Expense__c> result = BudgetController.getExpensesByCategoryName(invalidCategoryName, 'a018e00000inUBlAAM');
        System.assertEquals(0, result.size(), 'Result should be empty for getting expenses with an invalid category name');
    }
    
    
}