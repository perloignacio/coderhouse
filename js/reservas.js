class reservas{
    constructor(Desde,Hasta,Unidad,Pax){
        this.Desde=Desde;
        this.Hasta=Hasta;
        this.Unidad=Unidad;
        this.Pax=Pax;
    }

    Reservar(){
        let reservasActivas=JSON.parse(localStorage.getItem("reservas")) ?? [];
        const {Desde,Hasta,Unidad,Pax}=this;
        reservasActivas.push({Desde,Hasta,Unidad,Pax});
        localStorage.setItem("reservas",JSON.stringify(reservasActivas));
        return this;
       
    }

    Anular(element){
        console.log(element);
        let reservasActivas=JSON.parse(localStorage.getItem("reservas")) ?? [];
        reservasActivas.splice(reservasActivas.map(r=>r.Unidad).indexOf(element.IdUnidad),1);
        localStorage.setItem("reservas",JSON.stringify(reservasActivas));
        
       
    }
    
   
}

export default reservas;