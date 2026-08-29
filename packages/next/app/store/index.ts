import { create } from 'zustand'

interface IStore {
    accessToken: string;
    setToken: (token: string) => void;
    getToken: () => string;

    loading: boolean;
    setLoading: (loading: boolean) => void;
}

export const store = create<IStore>()((set, get) => {
    return {
        accessToken: '',
        setToken: (accessToken: string) => set({ accessToken }),
        getToken: () => get().accessToken,

        loading: false,
        setLoading: (loading: boolean) => set({ loading })
    }    
})
