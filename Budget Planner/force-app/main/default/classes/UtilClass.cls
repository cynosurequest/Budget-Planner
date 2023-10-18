public with sharing class UtilClass {
    /**
     * @description checkBudgetAccess
     * @return boolean
     */
    public static Boolean checkBudgetAccess() {
        if(
            Budget__c.SObjectType.getDescribe(SObjectDescribeOptions.DEFERRED).isAccessible() &&
            Schema.SObjectType.Budget__c.fields.Id.isAccessible() &&
            Schema.SObjectType.Budget__c.fields.Name.isAccessible() &&
            Schema.SObjectType.Budget__c.fields.Total_Budget__c.isAccessible() &&
            Schema.SObjectType.Budget__c.fields.Budget_Spent__c.isAccessible() &&
            Schema.SObjectType.Budget__c.fields.Available_Budget__c.isAccessible() &&
            Schema.SObjectType.Budget_Category__c.fields.Id.isAccessible() &&
            Schema.SObjectType.Budget_Category__c.fields.Name.isAccessible() &&
            Schema.SobjectType.Budget_Category__c.fields.Cost__c.isAccessible() &&
            Schema.SObjectType.Budget_Category__c.fields.Budget__c.isAccessible() &&
            Schema.SobjectType.Budget_Category_Expense__c.fields.Id.isAccessible() &&
            Schema.SObjectType.Budget_Category_Expense__c.fields.Name.isAccessible() &&
            Schema.SobjectType.Budget_Category_Expense__c.fields.Resource_Name__c.isAccessible() &&
            Schema.SobjectType.Budget_Category_Expense__c.fields.Cost__c.isAccessible() &&
            Schema.SobjectType.Budget_Category_Expense__c.fields.Budget__c.isAccessible() &&
            Schema.SobjectType.Budget_Category_Expense__c.fields.Budget_category__c.isAccessible()
        ){
            return true;
        }
        return false;
    }
   
}