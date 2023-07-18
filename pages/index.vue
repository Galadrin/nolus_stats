<template>
    <v-app class="rounded rounded-md">
      <!-- <v-navigation-drawer>
        <v-list>
          <v-list-item title="Navigation drawer"></v-list-item>
        </v-list>
      </v-navigation-drawer> -->
  
      <v-app-bar class="bg-pink-lighten-4" title="Crosnest tools"></v-app-bar>

      <v-main class="d-flex align-center justify-center" style="min-height: 300px;">
        <v-container >
          <!-- 1st line of widgets -->
          <v-row>
            <v-col cols="12">
              <!-- Title with refresh button -->
              <div class="mt-5 ml-5 text-h5">
                <v-sheet class="d-flex mb-6">
                  <v-sheet class="ma-2 me-auto">
                    Nolus protocol statistics
                    <v-btn @click="refresh()">
                      <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                  </v-sheet>
                </v-sheet>
              </div>
            </v-col>
          </v-row>
          <!-- 1st line of widgets -->
          <v-row>
            <v-col cols="6">
              <v-card>
                <div class="d-flex align-center justify-space-between">
                  <v-card-title>Load assets per due</v-card-title>
                  <v-switch v-model="value" color="primary" label="value" value="1" hide-details></v-switch>
                </div>
                <v-card-item>
                  <v-container>
                    <v-row>
                      <v-col cols=6>
                        <Pie type="doughnut" :data="appStore.total_loan_graph" :options="PieOptions"/>
                      </v-col>
                      <v-col cols="6">
                        <h3>Infos</h3>
                        <v-divider></v-divider>
                        <b>Number of active lease: {{ appStore.lease_list.length }}</b>
                      </v-col>
                    </v-row>
                  </v-container>
                  
                </v-card-item>
              </v-card>
            </v-col>

            <v-col cols="4">
              <v-card title="Liquidity usage">
                  <v-row>
                    <v-col cols="6">
                    <v-progress-circular v-if="liquidityPending"
                      indeterminate
                      color="primary"
                    >
                    </v-progress-circular>
                    <v-progress-circular v-else-if="liquidityError"
                      :size="175"
                      :width="30"
                      :model-value="100"
                      color="error"
                    >
                      error
                    </v-progress-circular>
                    <v-progress-circular v-else
                      :rotate="360"
                      :size="170"
                      :width="30"
                      :model-value="appStore.liquidity_ratio"
                      color="teal"
                    >
                      {{ appStore.liquidity_ratio }} %
                    </v-progress-circular>
                  </v-col>

                  <v-col cols="6">
                        <h3>Infos</h3>
                        <v-divider></v-divider>
                        <b>total liquidity available: {{ appStore.liquidity_deposit }}</b><br/>
                        <b>total liquidity used: {{ appStore.liquidity_used }}</b><br/>
                        <b>total interest due: {{ appStore.interest_due }}</b>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
          <!-- 1st line of widgets -->
          <v-row>
            <v-col cols="12">
              <!--  created_at: number,
                    amount: any,
                    interest_rate: number,
                    principal_due: any,
                    interest_due: any   -->
              <v-table height="300px" fixed-header>
                <thead>
                  <tr>
                    <th class="text-left">
                      block
                    </th>
                    <th class="text-left">
                      amount
                    </th>
                    <th class="text-left">
                      due
                    </th>
                    <th class="text-left">
                      interests
                    </th>
                    <th class="text-left">
                      rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in appStore.lease_list"
                    :key="item.created_at"
                  >
                    <td>{{ item.created_at }}</td>
                    <td>{{ item.amount.amount }} ${{ item.amount.ticker}}</td>
                    <td>{{ item.principal_due.amount }} ${{ item.principal_due.ticker}}</td>
                    <td>{{ item.interest_due.amount }} ${{ item.interest_due.ticker}}</td>
                    <td>{{ item.interest_rate }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-col>
          </v-row>
        </v-container>
      </v-main>

      <v-footer>
        <div class="bg-pink-lighten-4 d-flex w-100 align-center px-4">
          <strong>Get connected with us on social networks!</strong>

          <v-spacer></v-spacer>
          <v-btn
            key="mdi-github"
            class="mx-4"
            icon="mdi-github"
            variant="plain"
            size="small"
            href="https://github.com/Galadrin/nolus_stats"
          ></v-btn>
          <v-btn
            key="mdi-twitter"
            class="mx-4"
            icon="mdi-twitter"
            variant="plain"
            size="small"
            href="https://twitter.com/Crosnest_com"
          ></v-btn>
        </div>

        <div class="px-4 py-2 bg-black text-center w-100">
          {{ new Date().getFullYear() }} — <strong>Crosnest</strong>
        </div>
      </v-footer>
    </v-app>
  </template>

<script>
import { useAppStore } from "@/store/app"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Colors } from 'chart.js'
import { Pie } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend, Colors)


export default {
    async setup() {
        const appStore = useAppStore()
        
        const { data: leaseData, pending: leasePending, error: leaseError, refresh: leaseRefresh } = useFetch('/api/leases', {
          onResponse({request, response, options}) {
            const appStore = useAppStore()
            appStore.lease_total = response._data.total
            appStore.lease_list = response._data.leases
          }
        })
        const { data: liquidityData, pending: liquidityPending, error: liquidityError, refresh: liquidityRefresh } = useFetch('/api/lpp/liquidity', {
          onResponse({request, response, options}) {
            const appStore = useAppStore()
            appStore.liquidity_data = response._data
          },
        })
        
        const PieOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              colors: {
                enabled: true,
                forceOverride: true
              },
              legend: {
                position: 'left',
                labels: {font: {family: "'Helvetica Neue', 'monospace', 'Arial', sans-serif, monospace"}}
              }
            }
        }
        return { 
          appStore,
          leaseData, leasePending, leaseRefresh, PieOptions,
          liquidityData, liquidityPending, liquidityError, liquidityRefresh
        }
    },
    components: {
        Pie
    },
    data: () => ({
      sample: {
          created_at: 431411,
          amount: {
            amount: "299175478",
            ticker: "OSMO",
          },
          interest_rate: 122,
          principal_due: {
            amount: "50924169",
            ticker: "USDC",
          },
          interest_due: {
            amount: 103051,
            ticker: "USDC",
          },
        }
    }),
    methods: {
      refresh() {
        this.leaseRefresh()
        this.liquidityRefresh()
      },
      
    },
}


</script>