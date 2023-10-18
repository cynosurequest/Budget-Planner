@isTest
private class BudgetChartsTest {

    @isTest
    static void testGetBudgetCharts() {
       
        Budget__c testBudget = new Budget__c(
            Name = 'Test Budget',
            Total_Budget__c = 1000.0
        );
        insert testBudget;

        
        Budget_Category__c testCategory = new Budget_Category__c(
            Name = 'Test Category',
            Cost__c = 100.0,
            Budget__c = testBudget.Id
          
        );
        insert testCategory;

        
        Test.startTest();
        List<Budget__c> result = BudgetCharts.getBudgetCharts(testBudget.Id, 'SomeDuration');
        Test.stopTest();

       
        System.assertEquals(1, result.size(), 'Expected one Budget record');
        Budget__c resultBudget = result[0];
        System.assertEquals(testBudget.Id, resultBudget.Id, 'Ids should match');
      
    }
}