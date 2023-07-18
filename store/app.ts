import { defineStore, acceptHMRUpdate} from 'pinia'

export const useAppStore = defineStore('appStore', {
    // arrow function recommended for full type inference
    state: () => ({
        lease_list: [],
        lease_total: {} as totalLoan_t,
        liquidity_data: {} as liquidityDeposits_t,
        totalLendedDataUSD: {} as totalLoanGraph_t,
    }),
    getters: {
        liquidity_deposit():string {
            const total:number = this.liquidity_data.total.balance + this.liquidity_data.total.total_principal_due
            const total_scale:string = Number(total / 10**6).toFixed(2)
            return total_scale
        },
        liquidity_used():string {
            const used_scale:string = Number(this.liquidity_data.total.total_principal_due / 10**6).toFixed(2)
            return used_scale
        },
        interest_due():string {
            const due_scale:string = Number(this.liquidity_data.total.total_interest_due / 10**6).toFixed(2)
            return due_scale
        },
        liquidity_ratio():string {
            const total:number = this.liquidity_data.total.balance + this.liquidity_data.total.total_principal_due
            return Number((this.liquidity_data.total.total_principal_due / total)*100).toFixed(2)
        },
        total_loan_graph(): totalLoanGraph_t {
            // Create an array of objects with label and principal_due
            const label_data = Object.entries(this.lease_total).map(([label, item]) => ({ label, amount: item.amount ,principal_due: item.principal_due }));
            // Sort the data array by principal_due in descending order
            label_data.sort((a, b) => b.principal_due - a.principal_due);
            // Extract the labels and principal_dues from the sorted data
            const labels = label_data.map(item => item.label.padEnd(10) + String(Number(item.amount).toFixed(2)));
            const principal_dues = label_data.map(item => (item.principal_due));
            
            const ret:totalLoanGraph_t = {
                labels: labels,
                datasets: [
                  {
                    data: principal_dues,
                  }
                ]
              }
            return ret;
        }
    },
    actions: {

    }
})

function getExposant(label:string) {
    if(label === 'WETH') {return 10**18}
    else if (label === 'WBTC') {return 10**8}
    else {return 10**6}
  }

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
    }

interface liquidityDeposits_t {
    deposits: liquidityDeposit_t[]
    total: {
        balance: number,
        total_principal_due: number,
        total_interest_due: number,
        balance_nlpn: number
      }
}

interface liquidityDeposit_t {
    key: string, 
    deposit:number
}

interface totalLoan_t {
    [key: string]: totalLoanTicker_t
}
interface totalLoanTicker_t {
    amount: number,
    principal_due: number,
    interest_due: number
}

interface totalLoanGraph_t {
    labels: string[]
    datasets: [
        {
            data: number[]
        }
    ]
}