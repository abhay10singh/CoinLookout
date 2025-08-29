import {create} from "zustand" ;

type StateToggleStore = {
    toggle : boolean ;
    ChangeToggle : ()=>void ;
} ;

export const useStateToggleStore = create<StateToggleStore>((set)=>({
    toggle : true ,
    ChangeToggle : () => set((state) => ({ toggle: !state.toggle }))
    
}))

