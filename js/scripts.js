
import reservas from './reservas.js';
let initData;
let filtros=[];
let map;

function getData(){
    fetch("../assets/data.json")
        .then(response => {
            return response.json();
        })
        .then(jsondata =>{
            initData=jsondata;
            renderData(initData);
            
        });

}
function renderData(datos){
    document.getElementById("listado").innerHTML="";
    let html="<div class='row'>";
    for(let i=0;i<=datos.length-1;i++){
        html+=`
        <div class="col-6">
            <div class="card" id="unidad${datos[i].IdUnidad}">
                <div class="foto" style="background-image:url('assets/img/${datos[i].Foto}')"></div>
                <div class="info">
                    <div class="row">
                        <div class="col-9">
                            <h3>${datos[i].Nombre}</h3>
                        </div>
                        <div class="col-3 text-end">
                            <span>${datos[i].Calificaciones} <i class="fas fa-star"></i></span>
                        </div>
                    </div>
                    
                    <p class="text-muted ">
                        <span>${datos[i].Huespedes} Huespedes</span>
                        <span>${datos[i].Camas} Camas</span>
                        <span>${datos[i].Banios} Baños</span>
                        <span>${datos[i].Habitaciones} Habitaciones</span>
                    </p>
                    <h4>$ ${datos[i].Precio} / Noche</h4>
                    <button class='btn btn-primary w-100 mt-2 mb-3'>RESERVAR</button>
                </div>
            </div>
        </div>
      `;
    }
    html+="</div>";
    document.getElementById("resultados").innerText=`Se encontraron ${datos.length} resultados`;
    document.getElementById("listado").innerHTML=html;
    bindClickReserva();
}

function bindClickReserva(){
    initData.forEach((element) => {
        
        let card=document.getElementById(`unidad${element.IdUnidad}`);
        if(card!=null){
            let btn=card.getElementsByClassName("btn-primary")[0];
            btn.addEventListener("click",()=>{
                Reservar(element);
            });
        }
        
    });
}

function bindClickAnular(){
    initData.forEach((element) => {
        
        let card=document.getElementById(`unidad${element.IdUnidad}`);
        if(card!=undefined){
            let btn=card.getElementsByClassName("btn-danger")[0];
            btn.addEventListener("click",()=>{
                Anular(element);
            });
        }
        
    });
}
function Anular(element){
    let reserva=new reservas();
    reserva.Anular(element);
    Swal.fire('Ok','Muchas gracias, su reserva se cancelo correctamente','success');
    renderMisReservas();
}
function Reservar(unidad){
    if(Validar(unidad)){
        let fdesde=moment(document.getElementById("desde").value);
        let fhasta=moment(document.getElementById("hasta").value);
        let pax=parseInt(document.getElementById("pasajeros").value);
        let reserva=new reservas(fdesde._i,fhasta._i,unidad.IdUnidad,pax);
        reserva.Reservar();
        Swal.fire('Ok','Muchas gracias, su reserva se registro correctamente','success');
    }
    
}
function Validar(element){
    var hoy=new moment();
    if(document.getElementById("desde").value==""){
        Swal.fire('Upps','Debe indicar una fecha desde','warning');
        return false;
    }
    let fdesde=moment(document.getElementById("desde").value);

    if(document.getElementById("hasta").value==""){
        Swal.fire('Upps','Debe indicar una fecha hasta','warning');
        return false;
    }
    let fhasta=moment(document.getElementById("hasta").value);

    let pax=parseInt(document.getElementById("pasajeros").value);
    if(pax==0){
        Swal.fire('Upps','Debe indicar la cantidad de pasajeros','warning');
        return false; 
    }

    if(fdesde.diff(hoy, 'days')<0 ){
        Swal.fire('Upps','La fecha desde no puede ser menor a la fecha actual','warning');
        return false; 
    }
    if(fdesde.isAfter(fhasta,'day')){
        Swal.fire('Upps','La fecha hasta no puede ser menor a la fecha desde','warning');
        return false; 
    }
    if(fdesde.isSame(fhasta,'day')){
        Swal.fire('Upps','Las fechas de ingreso y salida no pueden ser iguales','warning');
        return false; 
    }

    if(element.Reservas.length>0){
        if(!checkDisponibilidad(element.IdUnidad,element.Reservas,fdesde,fhasta)){
            Swal.fire('Upps','No tenemos disponibilidad para esas fechas','warning');
            return false
        }
        
    }

    if(!checkDisponibilidad(element.IdUnidad,misReservas(),fdesde,fhasta)){
        Swal.fire('Upps','No tenemos disponibilidad para esas fechas','warning');
        return false
    }
        
    if(pax>element.Huespedes){
        Swal.fire('Upps','Este alojamiento no puede alojar tantos pasajeros','warning');
        return false;
    }

    return true;
}
function checkDisponibilidad(IdUnidad,listado,fdesde,fhasta){
    let band=true;
    listado.filter(l=>l.IdUnidad==IdUnidad).forEach(r=>{
        
        let rDesde=new moment(r.Desde);
        let rHasta=new moment(r.Hasta);
        console.log(rDesde.isBetween(fdesde,fhasta,'days','[)'));
        if(rDesde.isBetween(fdesde,fhasta,'days','[]') || rHasta.isBetween(fdesde,fhasta,'days','[]') || (rDesde.isSameOrBefore(fdesde,'day') && rHasta.isSameOrAfter(fhasta,'day')) || (rDesde.isSameOrAfter(fdesde,'day') && rHasta.isSameOrBefore(fhasta,'day')) ){
            /*(fechadesde between @desde and @hasta) or
                (fechahasta between @desde and @hasta) or
                (fechadesde < @desde and fechahasta > @hasta) or
                (fechadesde > @desde and fechahasta < @hasta)*/

            band= false;
        }
    })
    return band;
    
}
function misReservas(){
    return JSON.parse(localStorage.getItem("reservas")) ?? [];
}

function agregarFiltro(k,v){
    checkFiltrosAplicados(k,v);
    renderFiltros();
   
    filtrar();
}
function bindQuitarFiltros(){
    for(let i=0;i<=filtros.length-1;i++){
        let card=document.getElementById(`fl${i}`);
        let btn=card.getElementsByClassName("btn")[0];
        
        btn.addEventListener("click",()=>{
           
            quitarFiltro(i);
        })  
    }
}
function filtrar(){
    let data=initData;
    for(let i=0;i<=filtros.length-1;i++){
        switch(filtros[i].propiedad){
            case "Tipo":
                data=data.filter(d=>d.Tipo==filtros[i].valor);
                break;
            case "Banios":
                    data=data.filter(d=>d.Banios==filtros[i].valor);
                    break;
            case "Huespedes":
                    data=data.filter(d=>d.Huespedes>=filtros[i].valor);
                    break;
            case "Calificaciones":
                    data=data.filter(d=>d.Calificaciones>=filtros[i].valor);
                    break;
            case "Camas":
                    data=data.filter(d=>d.Camas>=filtros[i].valor);
                    break;
            case "Habitaciones":
                    data=data.filter(d=>d.Habitaciones>=filtros[i].valor);
                    break;
           
                    
        }
    }
    renderData(data); 
}

function checkFiltrosAplicados(k,v){
    let Agregar=true;
    for(let i=0;i<=filtros.length-1;i++){
        if(filtros[i].propiedad==k){
            filtros[i].valor=v;
            Agregar=false;
            break;
        }
    }
    if(Agregar){
        let dict={"propiedad":k,"valor":v};
        filtros.push(dict);
    }
}
function renderFiltros(){
    let html="";
    
    document.getElementById("filtros").innerHTML="";
    for(let i=0;i<=filtros.length-1;i++){
        html+=`
            <div class="fl" id="fl${i}">${filtros[i].propiedad}: ${filtros[i].valor} <button class="btn"><i class="fas fa-trash"></i></button></div>
            `; 
    }
    document.getElementById("filtros").innerHTML=html;
    bindQuitarFiltros();
}
function quitarFiltro(index){
    filtros.splice(index,1);
    renderFiltros();
    filtrar();
}
function buscar(){
    if(document.getElementById("pasajeros").value!=0){
        agregarFiltro("Huespedes",document.getElementById("pasajeros").value);
    }
    if(document.getElementById("desde").value!="" && document.getElementById("hasta").value!=""){
        agregarFiltro("Fecha",`${document.getElementById("desde").value} - ${document.getElementById("hasta").value}`);
        
    }
    
   
}
getData();

function renderMisReservas(){
    let reservas=misReservas();
    document.getElementById("listado").innerHTML="";
    let html="<div class='row'>";
    for(let i=0;i<=reservas.length-1;i++){
        let datos=initData.find(d=>d.IdUnidad==reservas[i].Unidad);
        html+=`
        <div class="col-6">
            <div class="card" id="unidad${datos.IdUnidad}">
                <div class="foto" style="background-image:url('assets/img/${datos.Foto}')"></div>
                <div class="info">
                    <div class="row">
                        <div class="col-9">
                            <h3>${datos.Nombre}</h3>
                        </div>
                        <div class="col-3 text-end">
                            <span>${datos.Calificaciones} <i class="fas fa-star"></i></span>
                        </div>
                    </div>
                    
                    <p class="text-muted ">
                        <span>${datos.Huespedes} Huespedes</span>
                        <span>${datos.Camas} Camas</span>
                        <span>${datos.Banios} Baños</span>
                        <span>${datos.Habitaciones} Habitaciones</span>
                    </p>
                    <h4>$ ${datos.Precio} / Noche</h4>
                    <hr>
                    <h4> ${reservas[i].Desde} / ${reservas[i].Hasta}</h4>
                    <h4> ${reservas[i].Pax} pasajeros</h4>
                    <button class='btn btn-danger w-100 mt-2 mb-3'>CANCELAR</button>
                </div>
            </div>
        </div>
      `;
    }
    html+="</div>";
    document.getElementById("resultados").innerText=`Se encontraron ${reservas.length} resultados`;
    document.getElementById("listado").innerHTML=html;
    bindClickAnular();
}
document.getElementById("btnBuscar").addEventListener("click",buscar);
document.getElementById("btnCasas").addEventListener("click",()=>{
    agregarFiltro("Tipo","CASAS")
});
document.getElementById("btnHoteles").addEventListener("click",()=>{
    agregarFiltro("Tipo","HOTELES")
});
document.getElementById("bntDepartamentos").addEventListener("click",()=>{
    agregarFiltro("Tipo","DEPARTAMENTOS")
});
document.getElementById("btnApart").addEventListener("click",()=>{
    agregarFiltro("Tipo","APART HOTEL")
});

document.getElementById("banio").addEventListener("change",()=>{
    if(document.getElementById("banio").value>0){
        agregarFiltro("Banios",document.getElementById("banio").value)
    }else{
        quitarFiltro(filtros.map(f=>f.propiedad).indexOf("Banio"));
    }    
});
document.getElementById("habitaciones").addEventListener("change",()=>{
    if(document.getElementById("habitaciones").value>0){
        agregarFiltro("Habitaciones",document.getElementById("habitaciones").value)
    }else{
        quitarFiltro(filtros.map(f=>f.propiedad).indexOf("Habitaciones"));
    }    
});
document.getElementById("camas").addEventListener("change",()=>{
    if(document.getElementById("camas").value>0){
        agregarFiltro("Camas",document.getElementById("camas").value)
    }else{
        quitarFiltro(filtros.map(f=>f.propiedad).indexOf("Camas"));
    }    
});
document.getElementById("califiacaciones").addEventListener("change",()=>{
    if(document.getElementById("banio").value>0){
        agregarFiltro("Calificaciones",document.getElementById("califiacaciones").value)
    }else{
        quitarFiltro(filtros.map(f=>f.propiedad).indexOf("Calificaciones"));
    }    
});
document.getElementById("misReservas").addEventListener("click",renderMisReservas);

