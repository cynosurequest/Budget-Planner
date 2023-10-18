import { LightningElement, track, wire, api } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import chartjs from '@salesforce/resourceUrl/chartJs';
import getBudgetList from '@salesforce/apex/BudgetCharts.getBudgetCharts';
import { refreshApex } from '@salesforce/apex';
import { subscribe , MessageContext } from 'lightning/messageService';
import BUDGET_TABLE_CHANNEL from '@salesforce/messageChannel/BUDGETTABLECHANNEL__c';
export default class ChartComponent extends LightningElement {
  @api recordId;
  @track chart;
  @track summaryChart;
  @track budgetData = [];
  @track selectedChartType = 'pie';
  selectedBudgetDuration = 'currentMonth';
  @track budgetSummaryData = [];
  @track budgetSpent;
  @track availableBudget;
  @track totalBudget;
  @track quarterlyBudgetSpent;
  @track quarterlyAvailableBudget;

  @wire(MessageContext)
  messageContext;
  @wire(getBudgetList, { recordId: '$recordId', duration: '$selectedBudgetDuration' })
wiredBudgetData;


  connectedCallback() {
    console.log('@@@@ Chart Connected Call Back@@@@@');
    this.loadBudgetData();
    
    this.subscription = subscribe(
                this.messageContext,
                BUDGET_TABLE_CHANNEL,
                (message) => this.handleMessage(message)
            );

  }
  chartTypeOptions = [
    { label: 'Pie Chart', value: 'pie' },
    { label: 'Doughnut Chart', value: 'doughnut' },
    { label: 'PolarArea Chart', value: 'polarArea' },
   ];
  budgetDurationOptions = [
    { label: 'Current Month', value: 'currentMonth' },
    { label: 'Quarterly Budget', value: 'quarterlybudget' },
    { label: 'Halfyearly Budget', value: 'halfyearlyMonths' },
    { label: 'Yearly Budget', value: 'yearlybudget' },
  ];
  handleChangeBudgetDuration(event) {
    this.selectedBudgetDuration = event.target.value;
    this.loadBudgetData();
  }
  handleChartTypeChange(event) {
    this.selectedChartType = event.detail.value;
    this.initializeChart();
    this.initializeSummaryChart();
  }
  loadBudgetData() {
    const duration = this.selectedBudgetDuration;
    getBudgetList({ recordId: this.recordId, duration })
      .then((result) => {
        this.budgetData = result;
        if (duration === 'currentMonth') {
          this.calculatemonthlyBudget();
        }
        if (duration === 'quarterlybudget') {
          this.calculateQuarterlyBudget();
        }
        if (duration === 'halfyearlyMonths') {
          this.calculateHalfyearlyBudget();
        }
        if (duration === 'yearlybudget') {
          this.calculateyearlyBudget();
        }
        this.initializeChart();
        this.initializeSummaryChart();
      })
      .catch((error) => {
        console.error('Error fetching budget category chart: ' + error);
      });
}
handleSubscribe() {
  if (this.subscription) {
      return;
  }
  this.subscription = subscribe(this.messageContext, BUDGET_TABLE_CHANNEL, (message) => {
      console.log(message.Records);
      //..this.Name = message.message;
      //..this.ShowToast('Success', message.message, 'success', 'dismissable');
  });
}
  calculatemonthlyBudget() {
    const totalBudget = this.budgetData[0].Total_Budget__c;
    const budgetSpent = this.budgetData[0].Budget_Spent__c;
   
    
    const availableBudget = totalBudget - budgetSpent;
    this.budgetSpent = budgetSpent;
   
    this.totalBudget = totalBudget;
    this.availableBudget = availableBudget;

  }
  calculateQuarterlyBudget() {
    const totalBudget = this.budgetData[0].Total_Budget__c;
    const budgetSpent = this.budgetData[0].Budget_Spent__c;
   
    const quarterlyBudgetSpent = budgetSpent * 3;
    const quarterlyAvailableBudget = totalBudget - quarterlyBudgetSpent;
    this.budgetSpent = quarterlyBudgetSpent;
    this.availableBudget = quarterlyAvailableBudget;
    
   
  }
  
  calculateHalfyearlyBudget() {
    const totalBudget = this.budgetData[0].Total_Budget__c;
    const budgetSpent = this.budgetData[0].Budget_Spent__c;
    const halfyearlyBudgetSpent = budgetSpent * 6;
    const halfyearlyAvailableBudget = totalBudget - halfyearlyBudgetSpent;
    this.budgetSpent = halfyearlyBudgetSpent;
    this.availableBudget = halfyearlyAvailableBudget;
  }
  calculateyearlyBudget() {
    const totalBudget = this.budgetData[0].Total_Budget__c;
    const budgetSpent = this.budgetData[0].Budget_Spent__c;
    const yearlyBudgetSpent = budgetSpent * 12;
    const yearlyAvailableBudget = totalBudget - yearlyBudgetSpent;
    this.budgetSpent = yearlyBudgetSpent;
    this.availableBudget = yearlyAvailableBudget;
  }
  initializeChart() {
    const ctx = this.template.querySelector('canvas').getContext('2d');
    const budgetData = this.budgetData[0];
    
    if (budgetData && budgetData.Budget_Categories__r && budgetData.Budget_Categories__r.length > 0) {
      const categories = budgetData.Budget_Categories__r;
      const labels = categories.map((category) => category.Name);
      const data = categories.map((category) => category.Cost__c);
      const backgroundColors = [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)',
        'rgba(255, 99, 132, 0.5)',
      ];
  
      if (this.chart) {
        this.chart.destroy();
      }
  
      this.chart = new window.Chart(ctx, {
        type: this.selectedChartType,
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: backgroundColors,
              borderColor: backgroundColors,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
  
      console.log('Budget Chart initialized:', this.chart);
      console.log('@@@Budget categories In Chart@@@@' +JSON.stringify(budgetData));
    } else {
      
      console.log('No data available to create the chart. Displaying a default chart.');
      
      
      if (this.chart) {
        this.chart.destroy();
      }
  
      this.chart = new window.Chart(ctx, {
        type: 'pie', 
        data: {
          labels: ['No Data'],
          datasets: [
            {
              data: [1], 
              backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)',
                'rgba(255, 99, 132, 0.5)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)',
                'rgba(255, 99, 132, 0.5)',
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  }
  
  initializeSummaryChart() {
    const ctx = this.template.querySelector('.summary-chart').getContext('2d');
    const labels = ['Budget Spent', 'Allotted Budget', 'Balance'];
    const data = [
      this.budgetSpent,
      this.totalBudget,
      this.availableBudget,
      
    ];
    const backgroundColors = ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)', 'rgba(255, 206, 86, 0.5)'];
  
    if (this.summaryChart) {
      this.summaryChart.destroy();
    }
  
    this.summaryChart = new window.Chart(ctx, {
      type: this.selectedChartType,
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  
    console.log('Summary Chart initialized:', this.summaryChart);
    console.log('@@@Budget details In chart@@@' +JSON.stringify(data));
  }
  handleMessage(message) {
    try {
      console.log('@@@@@@Received Message in the charts:@@@@@@', message);
  
      if (message && message.categories) {
        this.updateChartData(message.categories);
        console.log('@@@@@@@Handle category data Message:@@@@', message.categories);
      } else {
        console.log('Message is missing categories or is undefined.');
        
        this.updateChartData([]);
      }
  
      if (message && message.budgets && message.budgets.length > 0) {
       
        const budgetData = message.budgets[0];
        this.updateBudgetChartData(
          budgetData.Budget_Spent__c,
          budgetData.Total_Budget__c,
          budgetData.Available_Budget__c
        );
        console.log('@@@@@@Handle budget data Message:@@@@@@@@', message.budgets);
      } else {
        console.log('Message is missing budget data or is undefined.');
       
        this.updateBudgetChartData(undefined, undefined, undefined);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }
  

  updateBudgetChartData(budgetSpent, totalBudget, availableBudget) {
    console.log('@@@@@@@@@@In update budget chart Data Method@@@@@@@@@@@@');
    console.log('@@@@New values for budget spent , total budget and available budget values to the chart@@@@@', budgetSpent, totalBudget, availableBudget);
    
    if (this.summaryChart) {
      const newData = [budgetSpent, totalBudget, availableBudget];
      console.log('@@@@ New Budget details chart Data after subscribing to Lms: @@@@: ', +JSON.stringify(newData));

      this.summaryChart.data.labels = ['Budget Spent', 'Allotted Budget', 'Balance'];
      this.summaryChart.data.datasets[0].data = newData;

      this.summaryChart.update();
    }
  }
  
updateChartData(categories) {
  if (this.chart) {
   
    const newLabels = categories.map((category) => category.Name);
    const newData = categories.map((category) => category.Cost__c);
    console.log('@@@@New categories chart Data after subscribing to Lms:@@@@ ', +JSON.stringify(newData));

    
    this.chart.data.labels = [];
    this.chart.data.datasets[0].data = [];

    
    this.chart.data.labels = newLabels;
    this.chart.data.datasets[0].data = newData;

    
    this.chart.update();
  }
}
refreshData() {
  refreshApex(this.wiredBudgetData)
    .then((refreshedData) => {
      if (refreshedData && refreshedData.length > 0) {
        this.budgetData = refreshedData[0];
        this.updateChartData(this.budgetData.categories);
        this.updateBudgetChartData(
          this.budgetData.budgets.Budget_Spent__c,
          this.budgetData.budgets.Total_Budget__c,
          this.budgetData.budgets.Available_Budget__c
        );
        this.initializeChart();
        this.initializeSummaryChart();
      } else {
      
        console.error('Refreshed data is empty ');
      }
    })
    .catch((error) => {
      console.error('Error refreshing data: ' + error);
    });
}

renderedCallback() {
  if (window.Chart) {
    
    return;
  }

  Promise.all([loadScript(this, chartjs)])
    .then(() => {
      console.log('ChartJS library loaded successfully ');
      this.initializeChart();
      this.initializeSummaryChart();
    })
    .catch((error) => {
      console.error('Error loading ChartJS library:', error);
    });
}

}