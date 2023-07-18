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
                  <!-- <v-switch v-model="value" color="primary" label="value" value="1" hide-details></v-switch> -->
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
          <v-spacer></v-spacer>
          <!-- 1st line of widgets -->
          <v-data-table
            :headers="headers"
            :items="appStore.lease_list"
            multi-sort="true"
            class="elevation-1"
            density="comfortable"
          >
            <template v-slot:item.created_at="{ item }">
                block {{ item.columns.created_at }}
            </template>
            <template v-slot:item.amount="{ item }">
                {{ item.columns.amount.amount }} {{ item.columns.amount.ticker }}
            </template>
            <template v-slot:item.principal_due="{ item }">
                {{ item.columns.principal_due.amount }} {{ item.columns.principal_due.ticker }}
            </template>
            <template v-slot:item.interest_due="{ item }">
                {{ item.columns.interest_due.amount }} {{ item.columns.interest_due.ticker }}
            </template>
            <template v-slot:item.interest_rate="{ item }">
                {{ item.columns.interest_rate }} %
            </template>
          </v-data-table>
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
import { VDataTable } from 'vuetify/labs/VDataTable'
import { v4 as uuid } from 'uuid'

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
        const headers = [
        {
          title: 'Creation block',
          align: 'start',
          key: 'created_at',
        },
        { title: 'Amount', key: 'amount.amount'},
        { title: 'Amount ticker', key: 'amount.ticker'},
        { title: 'Due', key: 'principal_due.amount'},
        { title: 'Due ticker', key: 'principal_due.ticker'},
        { title: 'Interest due', key: 'interest_due.amount'},
        { title: 'Interest ticker', key: 'interest_due.ticker'},
        { title: 'Interest rate', key: 'interest_rate' },
      ]
      const desserts = [
        {
          name: 'Frozen Yogurt',
          calories: 159,
          fat: 6,
          carbs: 24,
          protein: 4,
          iron: '1%',
        },
        {
          name: 'Ice cream sandwich',
          calories: 237,
          fat: 9,
          carbs: 37,
          protein: 4.3,
          iron: '1%',
        },
        {
          name: 'Eclair',
          calories: 262,
          fat: 16,
          carbs: 23,
          protein: 6,
          iron: '7%',
        },
        {
          name: 'Cupcake',
          calories: 305,
          fat: 3.7,
          carbs: 67,
          protein: 4.3,
          iron: '8%',
        },
        {
          name: 'Gingerbread',
          calories: 356,
          fat: 16,
          carbs: 49,
          protein: 3.9,
          iron: '16%',
        },
        {
          name: 'Jelly bean',
          calories: 375,
          fat: 0,
          carbs: 94,
          protein: 0,
          iron: '0%',
        },
        {
          name: 'Lollipop',
          calories: 392,
          fat: 0.2,
          carbs: 98,
          protein: 0,
          iron: '2%',
        },
        {
          name: 'Honeycomb',
          calories: 408,
          fat: 3.2,
          carbs: 87,
          protein: 6.5,
          iron: '45%',
        },
        {
          name: 'Donut',
          calories: 452,
          fat: 25,
          carbs: 51,
          protein: 4.9,
          iron: '22%',
        },
        {
          name: 'KitKat',
          calories: 518,
          fat: 26,
          carbs: 65,
          protein: 7,
          iron: '6%',
        },
      ]
        return { 
          headers, desserts,
          appStore,
          leaseData, leasePending, leaseRefresh, PieOptions,
          liquidityData, liquidityPending, liquidityError, liquidityRefresh
        }
    },
    components: {
        Pie,
        VDataTable
    },
    data: () => ({
      
    }),
    methods: {
      refresh() {
        this.leaseRefresh()
        this.liquidityRefresh()
      },
      
    }
  }

</script>