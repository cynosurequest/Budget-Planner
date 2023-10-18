public class BudgetController {
    /**
* @description getbudget details 
* @return budgetList
* @param recordId Budget Id
*/
    @AuraEnabled
    public static List<Budget__c> getBudget(String recordId){
        List<Budget__c> budgetList = new List<Budget__c>();
        if(UtilClass.checkBudgetAccess()){
            budgetList =  [SELECT Id,Budget_Spent__c,Total_Budget__c,Available_Budget__c,
                           (SELECT Id, Name , Cost__c ,  Budget__c  FROM Budget_Categories__r)
                           FROM Budget__c 
                           WHERE Id =:recordId  WITH SECURITY_ENFORCED];
            
        }
        return budgetList;
    }
    /**
* @description getBudgetCategories details using recordId
* @return budgetCategoriesList get using recordId 
* @param recordId
*/
    @AuraEnabled
    public static List<Budget_Category__c> getBudgetCategories(String recordId){
        List<Budget_Category__c> budgetCategoriesList = new List<Budget_Category__c>();
        if(UtilClass.checkBudgetAccess()){
            budgetCategoriesList = [SELECT Id, Name, Cost__c FROM Budget_Category__c WHERE Budget__c = :recordId WITH SECURITY_ENFORCED];
        }
        return budgetCategoriesList;
        
    }
    
    /**
* @description getExpensesByCategoryName to fetch the expenses using category Name 
* @return budgetCategoryExpensesList returns the list of Category expenses 
* @param categoryName to fetch the expenses using Category Name
* @param recordId to fetch the expenses using budget Id
*/
    @AuraEnabled(cacheable=true)
    public static List<Budget_Category_Expense__c> getExpensesByCategoryName(String categoryName , String recordId) {
        List<Budget_Category_Expense__c> budgetCategoryExpensesList = new List<Budget_Category_Expense__c>();
        if(UtilClass.checkBudgetAccess()){
            budgetCategoryExpensesList = [SELECT Id, Name, Resource_Name__c, Cost__c, Budget__c , Budget_Category__c FROM Budget_Category_Expense__c WHERE Budget_Category__r.Name = :categoryName AND Budget__r.Id=:recordId WITH SECURITY_ENFORCED];
        }
        return budgetCategoryExpensesList;
    }
    
    
    /**
* @description updateBudgetCategory 
* @return updatedBudgetCategoryList
* @param categoryId
* @param name
* @param cost
*/
    
    @AuraEnabled
    public static List<Budget_Category__c> updateBudgetCategory(String categoryId, String name,  Decimal cost) {
        List<Budget_Category__c> updatedBudgetCategoryList = new List<Budget_Category__c>();
        
        if (UtilClass.checkBudgetAccess()) {
            
            // List<Budget_Category__c> existingCategoriesList = [SELECT Id FROM Budget_Category__c WHERE Id = :categoryId WITH SECURITY_ENFORCED];
            
            
            Budget_Category__c category = new Budget_Category__c(
                Id = categoryId,
                Name = name,
                Cost__c = cost
            );
            List<Budget__c> budgetsList = [SELECT Total_Budget__c , Budget_Spent__c , Available_budget__c FROM Budget__c  WITH SECURITY_ENFORCED];
            for(Budget__c budget : budgetsList){
                Decimal totalBudget = budget.Total_Budget__c;
                Decimal budgetSpent = budget.Budget_Spent__c;
                Decimal balanceCost = budget.Available_budget__c;
                if (balanceCost < 0) {
                    throw new AuraHandledException('Category cost cannot be greater than Alloted budget.');
                }
                if(cost > totalBudget ){
                    throw new AuraHandledException('Category cost cannot be greater than Alloted budget.');
                }
                
            }
            
            
            SObjectAccessDecision decision = Security.stripInaccessible(AccessType.UPDATABLE, new List<SObject>{category});
            Database.update(decision.getRecords(), false);
            
            return decision.getRecords();
            
            
        }
        
        return updatedBudgetCategoryList;
    }
    
    /**
* @description updateBudgetCategoryExpense
* @return updatedBudgetCategoryExpenseList
* @param expenseId
* @param expenseResourceName
* @param expenseCost
*/
    @AuraEnabled
    public static List<Budget_Category_Expense__c> updateBudgetCategoryExpense(String expenseId, String expenseResourceName, Decimal expenseCost) {
        List<Budget_Category_Expense__c> updatedBudgetCategoryExpenseList = new List<Budget_Category_Expense__c>();
        
        if (UtilClass.checkBudgetAccess()) {
            
            // List<Budget_Category_Expense__c> existingExpensesList = [SELECT Id FROM Budget_Category_Expense__c WHERE Id = :expenseId WITH SECURITY_ENFORCED];
            
            
            Budget_Category_Expense__c expense = new Budget_Category_Expense__c(
                Id = expenseId,
                Resource_Name__c = expenseResourceName,
                Cost__c = expenseCost
            );
            List<Budget_Category__c> budgetCategoryList  = [SELECT Id, Cost__c ,Total_Expense_Cost__c , Balance_Cost__c FROM Budget_Category__c WITH SECURITY_ENFORCED ];
            for(Budget_Category__c budgetCategory : budgetCategoryList){
                Decimal allotedCategoryCost = budgetCategory.Cost__c;
                Decimal totalExpenseCost = budgetCategory.Total_Expense_Cost__c;
                Decimal remainingCategoryCost = allotedCategoryCost - totalExpenseCost;
                if(remainingCategoryCost < 0){
                    throw new AuraHandledException ('Expense Cost should not be greater than the Category Cost');
                }
                if(expenseCost > allotedCategoryCost){
                    throw new AuraHandledException ('Expense Cost should not be greater than the Alloted Category Cost');
                }
            }
            
            
            SObjectAccessDecision decision = Security.stripInaccessible(AccessType.UPDATABLE, new List<SObject>{expense});
            Database.update(decision.getRecords(), false);
            
            return decision.getRecords();
            
        }
        
        return updatedBudgetCategoryExpenseList;
    }
    
    /**
* @description insertBudgetCategory
* @return insertedBudgetCategoryList
* @param recordId Budget Id 
* @param name
* @param resourceName 
* @param cost
*/
    
    
    
    @AuraEnabled
    public static List<Budget_Category__c> insertBudgetCategory(String recordId, String name, Decimal cost) {
        
        List<Budget_Category__c> insertedBudgetCategoryList = new List<Budget_Category__c>();
        
        if (UtilClass.checkBudgetAccess()) {
            Budget__c budget = [SELECT Total_Budget__c , Budget_Spent__c , Available_budget__c FROM Budget__c WHERE Id = :recordId WITH SECURITY_ENFORCED];
            Decimal totalBudget = budget.Total_Budget__c;
            Decimal budgetSpent = budget.Budget_Spent__c;
            Decimal balanceCost = budget.Available_budget__c;
            if (cost > balanceCost) {
                throw new AuraHandledException('Category cost cannot be greater than Alloted budget.');
            }
            List<Budget_Category__c> existingCategoriesList = [SELECT Id FROM Budget_Category__c WHERE Budget__c = :recordId WITH SECURITY_ENFORCED];
            
            Budget_Category__c category = new Budget_Category__c(
                Budget__c = recordId,
                Name = name,
                Cost__c = cost
            );
            
            SObjectAccessDecision decision = Security.stripInaccessible(AccessType.CREATABLE, new List<SObject>{category});
            Database.insert(decision.getRecords(), false);
            
            return decision.getRecords();
            
        }
        
        return insertedBudgetCategoryList;
    }
    
    
    
    
    
    /**
* @description insertBudgetCategoryExpenses
* @return insertBudgetCategoryExpenseList
* @param categoriesId
* @param budgetId
* @param expenseResourceName
* @param expenseCost
*/
    
    @AuraEnabled
    public static List<Budget_Category_Expense__c> insertBudgetCategoryExpenses(String categoriesId,  String budgetId , String expenseResourceName, Integer expenseCost) {
        List<Budget_Category_Expense__c> insertBudgetCategoryExpenseList = new List<Budget_Category_Expense__c>();
        if(UtilClass.checkBudgetAccess()){
            ///For loop
            Budget_Category__c budgetCategory  = [SELECT Id, Cost__c ,Total_Expense_Cost__c FROM Budget_Category__c WHERE Id =: categoriesId WITH SECURITY_ENFORCED ];
            Decimal allotedCategoryCost = budgetCategory.Cost__c;
            Decimal totalExpenseCost = budgetCategory.Total_Expense_Cost__c;
            Decimal remainingCategoryCost = allotedCategoryCost - totalExpenseCost;
            if(expenseCost > remainingCategoryCost){
                throw new AuraHandledException ('Expense Cost should not be greater than the Category Cost');
            }
            List<Budget_Category_Expense__c> existingExpensesList =  [SELECT Id FROM Budget_Category_Expense__c WHERE Budget__c = :budgetId AND Budget_Category__c =:categoriesId  WITH SECURITY_ENFORCED];
            Budget_Category_Expense__c categoryExpense = new Budget_Category_Expense__c(
                Budget_Category__c = categoriesId,
                Budget__c = budgetId,
                Resource_Name__c = expenseResourceName,
                Cost__c = expenseCost
                
            );
            
            SObjectAccessDecision decision = Security.stripInaccessible(AccessType.CREATABLE, new List<SObject>{categoryExpense});
            Database.insert(decision.getRecords(), false);
            
            return decision.getRecords();
        }
        
        return insertBudgetCategoryExpenseList;
        
    }
    
    
    
    /**
* @description deleteBudgetCategory
* @return deleteBudgetCategoryList
* @param categoryId
*/
    @AuraEnabled
    public static List<Budget_Category__c> deleteBudgetCategory(String categoryId) {
        List<Budget_Category__c> deleteBudgetCategoryList = new List<Budget_Category__c>();
        if (UtilClass.checkBudgetAccess()) {
            deleteBudgetCategoryList = [SELECT Id FROM Budget_Category__c WHERE Id = :categoryId WITH SECURITY_ENFORCED];
            
            SObjectAccessDecision decision = Security.stripInaccessible(AccessType.UPDATABLE, deleteBudgetCategoryList);
            Database.delete(decision.getRecords(), false);
            return decision.getRecords();
            
        }
        
        return deleteBudgetCategoryList;
    }
    
    
    
    /**
* @description deleteBudgetCategoryExpense
* @return deleteExpenseList
* @param expenseId
*/
    @AuraEnabled
    public static List<Budget_Category_Expense__c> deleteBudgetCategoryExpense(String expenseId) {
        
        List<Budget_Category_Expense__c>  deleteExpenseList = new List<Budget_Category_Expense__c>();
        if(UtilClass.checkBudgetAccess()){
            deleteExpenseList = [SELECT Id FROM Budget_Category_Expense__c WHERE Id = :expenseId WITH SECURITY_ENFORCED];
            
            SObjectAccessDecision decision = Security.stripInaccessible(AccessType.UPDATABLE, deleteExpenseList);
            Database.delete(decision.getRecords(), false);
            return decision.getRecords();
            
            
        }
        
        return deleteExpenseList ;
        
    }
    
    
    
}