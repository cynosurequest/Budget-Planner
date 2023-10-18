public class BudgetCharts {
    @AuraEnabled(cacheable=true)
    public static List<Budget__c> getBudgetCharts(Id recordId, String duration) {
        List<Budget__c> budgetData = new List<Budget__c>();
        
        if (UtilClass.checkBudgetAccess()) {
            budgetData = [SELECT Id, Name, Total_Budget__c, Budget_Spent__c, Available_Budget__c,
                (SELECT Id, Name, Cost__c FROM Budget_Categories__r)
                FROM Budget__c WHERE Id = :recordId WITH SECURITY_ENFORCED];
        }
        
        return budgetData;
    }
}