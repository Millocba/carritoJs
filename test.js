/*
En el archivo tarea2.js podemos encontrar un código de un supermercado que vende productos.
El código contiene 
    - una clase Producto que representa un producto que vende el super
    - una clase Carrito que representa el carrito de compras de un cliente
    - una clase ProductoEnCarrito que representa un producto que se agrego al carrito
    - una función findProductBySku que simula una base de datos y busca un producto por su sku
El código tiene errores y varias cosas para mejorar / agregar
​
Ejercicios
1) Arreglar errores existentes en el código
    #a) Al ejecutar agregarProducto 2 veces con los mismos valores debería agregar 1 solo producto con la suma de las cantidades.    
    #b) Al ejecutar agregarProducto debería actualizar la lista de categorías solamente si la categoría no estaba en la lista.
    #c) Si intento agregar un producto que no existe debería mostrar un mensaje de error.
​
2) Agregar la función eliminarProducto a la clase Carrito
    #a) La función eliminarProducto recibe un sku y una cantidad (debe devolver una promesa)
    #b) Si la cantidad es menor a la cantidad de ese producto en el carrito, se debe restar esa cantidad al producto
    #c) Si la cantidad es mayor o igual a la cantidad de ese producto en el carrito, se debe eliminar el producto del carrito
    #d) Si el producto no existe en el carrito, se debe mostrar un mensaje de error
    #e) La función debe retornar una promesa
​
3) Utilizar la función eliminarProducto utilizando .then() y .catch()
​
*/


// Cada producto que vende el super es creado con esta clase
class Producto {
    sku;            // Identificador único del producto
    nombre;         // Su nombre
    categoria;      // Categoría a la que pertenece este producto
    precio;         // Su precio
    stock;          // Cantidad disponible en stock

    constructor(sku, nombre, precio, categoria, stock) {
        this.sku = sku;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;

        // Si no me definen stock, pongo 10 por default
        if (stock) {
            this.stock = stock;
        } else {
            this.stock = 10;
        }
    }

}


// Creo todos los productos que vende mi super
const queso = new Producto('KS944RUR', 'Queso', 10, 'lacteos', 4);
const gaseosa = new Producto('FN312PPE', 'Gaseosa', 5, 'bebidas');
const cerveza = new Producto('PV332MJ', 'Cerveza', 20, 'bebidas');
const arroz = new Producto('XX92LKI', 'Arroz', 7, 'alimentos', 20);
const fideos = new Producto('UI999TY', 'Fideos', 5, 'alimentos');
const lavandina = new Producto('RT324GD', 'Lavandina', 9, 'limpieza');
const shampoo = new Producto('OL883YE', 'Shampoo', 3, 'higiene', 50);
const jabon = new Producto('WE328NJ', 'Jabon', 4, 'higiene', 3);

// Genero un listado de productos. Simulando base de datos
const productosDelSuper = [queso, gaseosa, cerveza, arroz, fideos, lavandina, shampoo, jabon];


// Cada cliente que venga a mi super va a crear un carrito
class Carrito {
    productos;      // Lista de productos agregados
    categorias;     // Lista de las diferentes categorías de los productos en el carrito
    precioTotal;    // Lo que voy a pagar al finalizar mi compra

    // Al crear un carrito, empieza vació
    constructor() {
        this.precioTotal = 0;
        this.productos = [];
        this.categorias = [];
    }

    /**
     * función que agrega @{cantidad} de productos con @{sku} al carrito
     */
    async agregarProducto(sku, cantidad) {
        console.log(`Agregando ${cantidad} ${sku}`);

        try {
            // Busco el producto en la "base de datos"
            const producto = await findProductBySku(sku);
            console.log(producto);

            // Verifico si hay cantidad en Stock
            if (producto.stock < cantidad && cantidad > 0) {
                throw new Error(`la cantidad solicitada supera el stock`);
            }
            //console.log("Producto encontrado", producto);

            // Busco si el producto fue cargado antes
            const productoExistente = this.productos.find((productox) => productox.sku === sku);
            if (productoExistente) {
                // Si ya fue cargado actualizo la cantidad
                console.log(`producto repetido ${productoExistente.nombre}`);
                //console.log(`El producto ${sku} ya existe`);
                productoExistente.cantidad += cantidad;
                // restando el stock
                producto.stock -= cantidad;
                // También actualizo el total
                this.precioTotal = this.precioTotal + (producto.precio * cantidad);
            } else {
                // Creo un producto nuevo
                const nuevoProducto = new ProductoEnCarrito(sku, producto.nombre, producto.categoria, cantidad);
                this.productos.push(nuevoProducto);
                
                this.precioTotal = this.precioTotal + (producto.precio * cantidad);
                // restando stock
                producto.stock -= cantidad;
                // Verifica si la categoria ya fue agregada antes
                const categoriaExistente = this.categorias.find((categoria) => categoria === producto.categoria);

                if (!categoriaExistente) {

                    this.categorias.push(producto.categoria);
                }
            }
            this.mostrarCarrito();

        } catch (error) {
            console.log("producto no encontrado: " + error);
        }

    }

    // Eliminar el item del carro
    async eliminarProducto(sku, cantidad) {

        // Busco el producto en la "base de datos"
        const productoBuscado = await findProductBySku(sku);
        
        return new Promise((resolve, reject) => {
            const productoExistente = this.productos.find((producto) => producto.sku === sku);

            if (!productoExistente) {
                reject(`El producto ${sku} no existe en el carrito.`);
                return;
            }
            if (cantidad<1) {
                reject(`La cantidad no es valida: ${cantidad}`);
                return;
            }

            if (cantidad < productoExistente.cantidad) {
                // Restar la cantidad especificada al producto en el carrito
                productoExistente.cantidad -= cantidad;
                this.precioTotal -= productoBuscado.precio * cantidad;
                
                // Devuelvo el Stock
                productoBuscado.stock += cantidad;
                resolve(`Se eliminaron ${cantidad} unidades del producto ${sku}.`);
            } else{
                // Eliminar completamente el producto del carrito
                const productoIndex = this.productos.indexOf(productoExistente);
                const productoEliminado = this.productos.splice(productoIndex, 1)[0];
                this.precioTotal -= productoBuscado.precio * productoEliminado.cantidad;
                
                // Devuelvo el Stock
                productoBuscado.stock += productoEliminado.cantidad;

                // Verificar si es necesario eliminar la categoría
                const productosCategoria = this.productos.filter((producto) => producto.categoria === productoBuscado.categoria);
                console.log(productosCategoria);
                if (productosCategoria.length === 0) {
                    const categoriaIndex = this.categorias.indexOf(productoBuscado.categoria);
                    if (categoriaIndex !== -1) {
                        this.categorias.splice(categoriaIndex, 1);
                    }
            }

                resolve(`Se eliminó el producto ${sku} del carrito.`);
            }
        });
    }

    // mostrar carro completo
    mostrarCarrito() {
        console.log(this);
    }

}

// Cada producto que se agrega al carrito es creado con esta clase
class ProductoEnCarrito {
    sku;       // Identificador único del producto
    nombre;    // Su nombre
    categoria;    // Su categoria
    cantidad;  // Cantidad de este producto en el carrito

    constructor(sku, nombre, categoria, cantidad) {
        this.sku = sku;
        this.nombre = nombre;
        this.categoria = categoria;
        this.cantidad = cantidad;
    }

}

// Función que busca un producto por su sku en "la base de datos"
function findProductBySku(sku) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const foundProduct = productosDelSuper.find(product => product.sku === sku);
            if (foundProduct) {
                resolve(foundProduct);
            } else {
                reject(`Product ${sku} not found`);
            }
        }, 150);
    });
}

const carrito = new Carrito();
/* async function gestionarCarrito() {
    // Agregar productos al carrito
    await carrito.agregarProducto('WE328NJ', 2);
    await carrito.agregarProducto('WE328NJ', 4);
    await carrito.agregarProducto('OL883YE', 3);
    await carrito.agregarProducto('KS944RUR', 5);
    await carrito.agregarProducto('RT324GD', 5);
    await carrito.agregarProducto('FN312PPE', 5);

    // Eliminar producto del carrito
    try {
        const eliminarMensaje = await carrito.eliminarProducto('WE328NJ', 5);
        console.log(eliminarMensaje);
        carrito.mostrarCarrito(); // Mostrar el estado actual del carrito después de eliminar el producto
    } catch (error) {
        console.log(error);
    }
}*/

    carrito.agregarProducto('WE328NJ', 2);
    carrito.agregarProducto('WE328N', 4);
    carrito.agregarProducto('OL883YE', 3);
    carrito.agregarProducto('KS944RUR', 5);
    carrito.agregarProducto('RT324GD', 5);
    carrito.agregarProducto('FN312PPE', 5)
    .then(carrito.eliminarProducto('FN312PPE', 2)
    .then((mensaje) => {
        console.log(mensaje);
        carrito.mostrarCarrito();
    })
    .catch((error) => {
        console.log(error);
    }))
    .then(carrito.eliminarProducto('WE328NJ', 3)
    .then((mensaje) => {
        console.log(mensaje);
        carrito.mostrarCarrito();
    })
    .catch((error) => {
        console.log(error);
    }));