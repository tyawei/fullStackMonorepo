import { create } from 'zustand'

interface IStore {
    accessToken: string;
    setToken: (token: string) => void;
    getToken: () => string;
}

export const store = create<IStore>()((set, get) => {
    return {
        accessToken: '',

        setToken: (accessToken: string) => set({ accessToken }),

        getToken: () => get().accessToken
    }    
})
