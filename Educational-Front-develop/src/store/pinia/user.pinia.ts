import { defineStore } from 'pinia'

export const useStore = defineStore('store', {
  state: () => ({
    userinfo:{
      staffid :"",
      token:""
    },
  }),
  persist: {
    storage: sessionStorage,
  },
})