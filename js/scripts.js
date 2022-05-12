/**/
let initData;
let filtros=[];
function initMap() {
    var mapProp= {
      center:new google.maps.LatLng(-31.4168582,-64.1720676,),
      zoom:12,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
}

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
    $(".listado").html("");
    let html="<div class='row'>";
    for(let i=0;i<=datos.length-1;i++){
        html+=`
        <div class="col-6">
            <div class="card">
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
                        <span>${datos[i].Camas} Camas</span>
                    </p>
                    <h4>$ ${datos[i].Precio} / Noche</h4>
                    <button class='btn btn-primary w-100 mt-2 mb-3'>RESERVAR</button>
                </div>
            </div>
        </div>
      `;
    }
    html+="</div>";
    $(".resultados").html(`Se encontraron ${datos.length} resultados`)
    $(".listado").html(html);
    
}

function agregarFiltro(k,v){
    checkFiltrosAplicados(k,v);
    renderFiltros();
    filtrar();
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
                    data=data.filter(d=>d.Camas==filtros[i].valor);
                    break;
            case "Habitaciones":
                    data=data.filter(d=>d.Habitaciones==filtros[i].valor);
                    break;
            /*
                (fechadesde between @desde and @hasta) or
                (fechahasta between @desde and @hasta) or
                (fechadesde < @desde and fechahasta > @hasta) or
                (fechadesde > @desde and fechahasta < @hasta)
            */       
                    
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
    
    $(".filtros").html("");
    for(let i=0;i<=filtros.length-1;i++){
        html+=`
            <div class="fl">${filtros[i].propiedad}: ${filtros[i].valor} <i class="fas fa-trash" onclick="quitarFiltro(${i})" role="button"></i></div>
            `; 
    }
    $(".filtros").html(html);
}
function quitarFiltro(index){
    filtros.splice(index,1);
    renderFiltros();
    filtrar();
}
function buscar(){
    if($("#pasajeros").val()!=0){
        agregarFiltro("Huespedes",$("#pasajeros").val());
    }
    if($("#desde").val()!="" && $("#hasta").val()!=""){
        agregarFiltro("Fecha",`${$("#desde").val()} - ${$("#hasta").val()}`);
        
    }
    
   
}
getData();