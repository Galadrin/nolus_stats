<template>
    <v-layout class="rounded rounded-md">
      <!-- <v-navigation-drawer>
        <v-list>
          <v-list-item title="Navigation drawer"></v-list-item>
        </v-list>
      </v-navigation-drawer> -->
  
      <!-- <v-app-bar title="Nolus statistics"></v-app-bar> -->

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
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        
<!-- 
        <v-list >
            <h3>Total leases values</h3>

            <v-list-item
                v-for="(obj, key) in data"
                :key="key"
                :value="obj"
                color="primary"
                variant="tonal"
            >
                <v-list-item-title > {{ key }}</v-list-item-title>
                <v-list-item-subtitle > {{ obj }}</v-list-item-subtitle>

            </v-list-item>
        </v-list> -->
      </v-main>
    </v-layout>
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
    data() {
      return {}
    },
    methods: {
      refresh() {
        this.leaseRefresh()
        this.liquidityRefresh()
      },
      
    },
}


</script>