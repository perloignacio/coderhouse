
/*La idea de este codigo es simular un sitio de reservas de estadias. Los datos que se ingresan en el buscador son los que se
toman para "reservar", esto es asi para lograr simular la funcionalidad. 
Se implementa una clase reservas la cual tiene 2 metodos, reservar y anular, los datos de las reservas se almacenan en localstorage
Se puede realziar filtros de unidades por tipologia, cantidad de habitaciones / camas. Cantidade baños, cantidad de personas. 
Los filtros son acumulativos
*/
import reservas from './reservas.js';

let initData;
let filtros=[];
let map;
let markersArray=[];
let infowindow = new google.maps.InfoWindow();
/*obtenemos el json simulado de hospedajes disponibles*/
function getData(){
    initMap();
    fetch("../assets/data.json")
        .then(response => {
            return response.json();
        })
        .then(jsondata =>{
            initData=jsondata;
            renderData(initData);
            
        }).catch(reject=>{
            Swal.fire("upps","Ocurrio un error al obtener los datos");
        });
    

}

/*Renderizamos el contenido del json*/
function renderData(datos){
    document.getElementsByClassName("loading")[0].classList.remove("oculto")
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
    
    AgregaMarkers(datos).then(res=>{
       document.getElementsByClassName("loading")[0].classList.add("oculto")
    })
}

/*Cada card, contiene un boton reserva, cada vez que se renderiza el lista, se asocia el boton con la funcion reserva*/
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

/*Para el caso de "mis reservas", en vez de poder reservar, lo que se puede realizar es Anular una reserva, 
desde este metodo se asocia el click del boton anular y la funcion anular */
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

/*Se intancia al metodo anular de la clase reservas, el mismo limpia la posicion del array de reservas almacenados en local storage */
function Anular(element){
    let reserva=new reservas();
    reserva.Anular(element);
    Swal.fire('Ok','Muchas gracias, su reserva se cancelo correctamente','success');
    renderMisReservas();
}
/*Se intancia al metodo reservar de la clase reservas, el mismo agrega una posicion al array de reservas almacenados en local storage, 
siempre y cuando se cumplan con ciertas validaciones. */
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
/*Validamos los valores de fecha desde, hasta, cantidad de personas. y por otro lado validamos la disponibilidad de la unidad 
tomando los datos del json, simulando resrvas generadas por otro usuario, y las de local storage, simulando mis reservas */

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

/*Funcion para validar la disponiblidad de la unidad */
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
/*Esta funcion podria haber estado en la clase reservas, pero me parecio que no era de su scope por lo que la deje a nivel global. */
function misReservas(){
    return JSON.parse(localStorage.getItem("reservas")) ?? [];
}

/*Cada vez que se hace click en la tipologia de la unidad o se cambia algun valor, se llama a esta funcion, la idea fue la de crear 
una especie de diccionario clave, valor para luego filtrar por dicho diccionario */
function agregarFiltro(k,v){
    checkFiltrosAplicados(k,v);
    renderFiltros();
   
    filtrar();
}
/*Se asocia el comportamiento de la "cruz" de cada filtro con el metodo que retira el filtro del listado. */
function bindQuitarFiltros(){
    for(let i=0;i<=filtros.length-1;i++){
        let card=document.getElementById(`fl${i}`);
        let btn=card.getElementsByClassName("btn")[0];
        
        btn.addEventListener("click",()=>{
           
            quitarFiltro(i);
        })  
    }
}

/*En base al diccionario hacemos un switch, al ser controlado por la pantalla, no es necesario pasarlo a min / may ya que sabes de antemano
el formato en el que va a venir, y realizamos un filtro del array obtenido en el json y llamamos a la funcion de renderizar resultados. */
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

/* Esta funcion es para el caso en el que ya tenga en el diccionario la clave, por lo tanto en dicho caso solo actualizo valor */
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

/* En base al array de filtros aplicados, se renderizan para que el usuario pueda visualizar / quitar filtros */
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

/* Borrar del array de filtros el seleccionado por el usuario */
function quitarFiltro(index){
    filtros.splice(index,1);
    renderFiltros();
    filtrar();
}

/* Solo se agrega el filtro por cantidad de pasajeros, la disponiblidad se valida, no se filtra */
function buscar(){
    if(document.getElementById("pasajeros").value!=0){
        agregarFiltro("Huespedes",document.getElementById("pasajeros").value);
    }
    
    
   
}


/*Inicializa el mapa en la ciudad de cordoba*/
function initMap() {
    let mapProp= {
    center:new google.maps.LatLng(-31.4168582,-64.1720676),
    zoom:12,
    
    };
    map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
}

/*Realizamos una promesa para que cada vez que se actualice el listado se marquen en el mapa las ubicaciones de los establecimientos.
Ponemos un timeout a modo de simulacion de una carga de contenidos*/
const AgregaMarkers = (datos) => new Promise((resolve, reject) => {
    limpiaMarkers();
    for(let i=0;i<=datos.length-1;i++){
        addMarker(new google.maps.LatLng(datos[i].Lat,datos[i].Lng),datos[i].Nombre,i)
    }
    setTimeout(() => {
        resolve({
            error: false,     
          });
    }, 2000);
    
});

/*Limpiamos los puntos previamente marcados.*/
function limpiaMarkers(){
    for (var i = 0; i < markersArray.length; i++ ) {
        markersArray[i].setMap(null);
    }
}
/*Funcion que agrega los puntos al mapa.*/
function addMarker(location,nombre,i) {
     let marker = new google.maps.Marker({
        position:location,
        map: map
        
    });
    google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
          infowindow.setContent(nombre);
          infowindow.open(map, marker);
        }
      })(marker, i));
    markersArray.push(marker);
}
/* llamada al metodo que da inicio a la pantalla */
getData();

/* Renderiza las reservas realizadas por el usuario, mostrando la fecha desde / hasta que indico mas la cantidad de pasajeros. 
El usuario puede cancelar una reserva */
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

/* Bindeamos los botones del sitio*/
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
/*---*/ 
