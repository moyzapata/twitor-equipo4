const db = new PouchDB('mensajes');

function guardarMensaje(mensaje){
    mensaje._id= new Date().toISOString();
    return db.put(mensaje).then(()=>{
        self.registration.sync.register('nuevo-post');
        const newResp = {ok:true,offline:true};
        return new Response(JSON.stringify(newResp)); 

    });
}

function postearMensajes(){
    return db.allDocs({include_docs:true}).then(docs=>{
        docs.rows.forEach(row=>{
            const doc=row.doc;

            const fetchProm = fetch('api',{
                headers:{
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify(doc)
            }).then(resp=>{
                return db.remove(doc);
            });
            posteos.push(fetchProm);
        });
        return Promise.all(posteos);
    });
}