function checkIds(query, list) {
    // Crea una variable booleana que se inicialice en true
    let found = true;
    query.forEach((e)=>{
      if (!list.includes(e)) {
        found = false;
      }
    })
    
    // Recorre el array de la query
    // for (let i = 0; i < query.length; i++) {
    //   // Si el elemento en la posición i del array de la query no se encuentra en el array de la lista, cambia el valor de la variable `found` a false
    //   if (!list.includes(query[i])) {
    //     found = false;
    //   }
    // }
    
    // Devuelve el valor de la variable `found`
    return found;
  }
  
  // Usa la función con dos arrays de ejemplo
  let query = [1, 2, 3];
  let list = [1, 2, 3, 4, 5];
  let result = checkIds(query, list);
  
  // Imprime el resultado en la consola
  console.log(result); // debería mostrar true