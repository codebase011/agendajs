import { KEY_AGENDA, SECTIONS } from "./consts.js";

export default class Agenda {
  $container;
  contactsData;

  constructor($container) {
    console.log("agenda constructor");
    this.$container = $container;
    // Cargar los datos del localStorage
    const datosLocalStorage = localStorage.getItem(KEY_AGENDA);
    this.contactsData = datosLocalStorage ? JSON.parse(datosLocalStorage) : [];
    console.log(this.contactsData);
  }

  /**********************************************************************************************************
   * Renderiza la sección asociada a cada botón
   * @param {*} section - Sección a renderizar
   * @param {*} contact - Opcional para renderizar la sección "Editar"  con los datos de un contacto
   **********************************************************************************************************/
  render(section, contact) {
    // Según la sección que se va a renderizar, se cambia el estilo correspondiente al li 
    const $opcionesMenu = document.querySelectorAll('nav li')
    $opcionesMenu.forEach(li => li.classList.remove('active'))
    Array.from($opcionesMenu).find(o => o.dataset.section === section).classList.add("active")

    // Rendedizar la sección correspondiente
    switch (section) {
      case SECTIONS.ADD:
        console.log("render add section");
        this.renderAddSection();
        break;
      case SECTIONS.LIST:
        console.log("render list section");
        this.renderListSection();
        break;
      case SECTIONS.EDIT:
        console.log("render edit section", contact);
        this.renderEditSection();
        break;
      case SECTIONS.SEARCH:
        console.log("render search section");
        this.renderSearchSection();
        break;
      default:
        console.log("page error");
    }
  }

  /**********************************************************************************************************
   * Renderiza la sección de "Añadir"
   **********************************************************************************************************/
  renderAddSection() {
    const $addSection = document.createElement("div");

    // Poner el id para los estilos
    $addSection.id = "add-section";

    // Codigo HTML de la sección "Añadir"
    $addSection.innerHTML = `
      <div class="fila">
        <label for="name">Nombre:</label>
        <input type="text" name="name" id="name">
      </div>
      <div class="fila">
        <label for="surname">Apellidos:</label>
        <input type="text" name="surname" id="surname">
      </div>
      <div class="fila">
        <label for="address">Dirección:</label>
        <input type="te" name="address" id="address">
      </div>
      <div class="fila">
        <label for="tel">Teléfono:</label>
        <input type="tel" name="tel" id="tel">
      </div>
      <div class="fila-alinear-dcha">
        <p id="error"></p>
        <button id="save-button">Guardar</button>
      </div>
    `;

    this.$container.innerHTML = "";
    this.$container.appendChild($addSection);

    // Selectores de la sección
    const $name = $addSection.querySelector("#name");
    const $surname = $addSection.querySelector("#surname");
    const $address = $addSection.querySelector("#address");
    const $tel = $addSection.querySelector("#tel");
    const $error = $addSection.querySelector("#error");
    const $addButton = $addSection.querySelector("#save-button");

    $name.focus()

    // Asociar el evento al botón
    $addButton.addEventListener("click", () => {
      this.handleAddClick($name, $surname, $address, $tel, $error);
    });
  }

  /**********************************************************************************************************
   * Renderiza la sección de "Listar"
   **********************************************************************************************************/
  renderListSection() {
    const $listSection = document.createElement("div");

    // Para los estilos
    $listSection.id = "list-section";

    $listSection.innerHTML = "";

    // Función para eliminar el contacto
    const deleteContact = (contact) => {
      this.contactsData = this.contactsData.filter((c) => c !== contact);
      localStorage.setItem(KEY_AGENDA, JSON.stringify(this.contactsData));
      this.render(SECTIONS.LIST)
    };

    if (!this.contactsData || this.contactsData.length === 0){
        $listSection.innerHTML += `
          <div id="no-contacts-container">
            <p id="list-section-info">No hay ningún contacto en la agenda.</p>
            <button id="add-button-list">Añadir contacto</button>
          </div>
        `;

        const $addButton = $listSection.querySelector('button');
        $addButton.addEventListener('click', () => this.render(SECTIONS.ADD))
    }
    else {
      this.contactsData.forEach((contact) => {
        const $contactContainer = document.createElement("div");

        $contactContainer.classList.add("contact");
        $contactContainer.innerHTML += `
            <p>${contact.name} ${contact.surname}</p>
            <p>${contact.address}</p>
            <p>${contact.tel}</p>
            <div id="button-container">
              <button class="edit-button" title="Editar registro">✏️</button>
              <button class="delete-button" title="Eliminar registro">🗑️</button>
            </div>
        `;
  
        const $editButton = $contactContainer.querySelector(".edit-button");
        const $deleteButton = $contactContainer.querySelector(".delete-button");
  
        $editButton.addEventListener("click", () => {
          //this.renderEditSection(contact);
          this.render(SECTIONS.EDIT, contact)
          console.log("Editando el contacto", contact);
        });
  
        $deleteButton.addEventListener("click", () => {
          console.log("Eliminando el contacto", contact);
          deleteContact(contact);
        });
  
        $listSection.appendChild($contactContainer);
      });
    }

    this.$container.innerHTML = "";
    this.$container.appendChild($listSection);
  }

  /**********************************************************************************************************
   * Renderiza la sección de "Buscar"
   * Busca la entrada por nombre, apellido o telefono
   **********************************************************************************************************/
  renderSearchSection() {
    const $searchSection = document.createElement("div");

    // Para los estilos
    $searchSection.id = "search-section";

    $searchSection.innerHTML = `
    <div class="search-menu">
      <div>
        <span>Filtrar por</span>
        <select id="select-search">
          <option value="name">Nombre</option>
          <option value="surname">Apellidos</option>
          <option value="tel">Teléfono</option>
        </select>
        <input type="text" id="input-search-string" placeholder="Texto a buscar">
      </div>  
      <div>
        <input type="checkbox" id="checkbox-exact-search">
        <label for="checkbox-exact-search"><small>Palabras exactas</small></label>
        <input type="checkbox" id="checkbox-case-sensitive">
        <label for="checkbox-case-sensitive"><small>Case sensitive</small></label>
      </div>
    </div>
    <div id="container-filtered-contacts">
    </div>
  `;

    this.$container.innerHTML = "";
    this.$container.appendChild($searchSection);

    // Selectores
    const $selectSearch = $searchSection.querySelector("#select-search");
    const $inputSearchString = $searchSection.querySelector("#input-search-string");
    const $checkboxExactSearch = $searchSection.querySelector("#checkbox-exact-search");
    const $checkboxCaseSensitive = $searchSection.querySelector("#checkbox-case-sensitive");
    const $containerFilteredContacts = $searchSection.querySelector("#container-filtered-contacts");

    // Función para renderizar los resultados
    const renderFilteredContacts = (filteredContacts) => {
      $containerFilteredContacts.innerHTML = "";

      if (filteredContacts.length === 0) {
        $containerFilteredContacts.innerHTML = `<p id="info">No se encontraron resultados.</p>`;
        return;
      }

      filteredContacts.forEach((contact) => {
        $containerFilteredContacts.innerHTML += `
        <div class="contact">
          <p>${contact.name} ${contact.surname}</p>
          <p>${contact.address}</p>
          <p>${contact.tel}</p>
        </div>
      `;
      });
    };

    // Manejador para los cambios
    const handleOnChange = () => {
      const exactSearch = $checkboxExactSearch.checked;
      const caseSensitive = $checkboxCaseSensitive.checked;
      const searchField = $selectSearch.value;
      const searchString = caseSensitive
        ? $inputSearchString.value.trim()
        : $inputSearchString.value.trim().toLowerCase();

      let filteredContacts = [...this.contactsData];

      if (searchString !== "") {
        filteredContacts = this.contactsData.filter((contact) => {
          const fieldValue = caseSensitive ? contact[searchField] : contact[searchField].toLowerCase();

          // Si la busqueda exacta está activada se devuelve el contacto solo si coincide
          if (exactSearch) return fieldValue === searchString;

          // Si no está activada se devuelve el contacto si el campo incluye el texto buscado
          return fieldValue.includes(searchString);
        });
      }

      renderFilteredContacts(filteredContacts);
    };

    // Asociar eventos
    $selectSearch.addEventListener("change", handleOnChange);
    $inputSearchString.addEventListener("input", handleOnChange);
    $checkboxExactSearch.addEventListener("change", handleOnChange);
    $checkboxExactSearch.addEventListener("click", () => $inputSearchString.focus());
    $checkboxCaseSensitive.addEventListener("change", handleOnChange);
    $checkboxCaseSensitive.addEventListener("click", () => $inputSearchString.focus());

    // Mostrar todos los contactos por defecto
    renderFilteredContacts(this.contactsData);
  }

  /**********************************************************************************************************
   * Renderiza la sección de "Editar"
   * @param {*} contact
   * Se le puede pasar un contacto (opcional)
   **********************************************************************************************************/
  renderEditSection(contact) {
    const $editSection = document.createElement("div");
    let selectedIndex;
    // Para los estilos
    $editSection.id = "edit-section";

    // Codigo HTML de la sección "Editar"
    $editSection.innerHTML = `
      <div id="edit-contact-menu">
        <div class="fila">
          <label for="select-contact-list">Contacto:</label>
          <select id="select-contact-list" size="1">
          <option disabled>Selecciona un contacto</option>
          ${this.contactsData.map((c, index) => {
            // Si el contacto que se pasa por parametro es el actual,
            // Guardar el indice para luego asiganrlo al "selectedIndex" del select
            // (Si no, no coincidirán los datos que se muestran)
            if (contact?.tel === c.tel) {
              selectedIndex = index + 1;
              console.log("si", selectedIndex);
            }

            return `<option value='${c.tel}'>${c.name} ${c.surname} | ${c.tel} | ${c.address}</option>`;
          })}
          </select>
        </div>
      </div>
      <div class="fila">
        <label for="name">Nombre:</label>
        <input type="text" id="name" value="${contact?.name || ""}" ${contact ? "" : "disabled"}>
      </div>
      <div class="fila">
        <label for="surname">Apellidos:</label>
        <input type="text" id="surname" value="${contact?.surname || ""}" ${contact ? "" : "disabled"}>
      </div>
      <div class="fila">
        <label for="address">Dirección:</label>
        <input type="tel" id="address" value="${contact?.address || ""}" ${contact ? "" : "disabled"}>
      </div>
      <div class="fila">
        <label for="tel">Teléfono:</label>
        <input type="tel" id="tel" value="${contact?.tel || ""}" ${contact ? "" : "disabled"}>
      </div>
      <div class="fila-alinear-dcha">
        <p id="error"></p>
        <button id="cancel-button">Cancelar</button>
        <button id="save-button" ${contact ? "" : "disabled"}>Guardar</button>
      </div>
    `;

    this.$container.innerHTML = "";
    this.$container.appendChild($editSection);

    // Selectores
    const $selectContactList = $editSection.querySelector("#select-contact-list");
    const $name = $editSection.querySelector("#name");
    const $surname = $editSection.querySelector("#surname");
    const $address = $editSection.querySelector("#address");
    const $tel = $editSection.querySelector("#tel");
    const $cancelButton = $editSection.querySelector("#cancel-button");
    const $saveButton = $editSection.querySelector("#save-button");
    const $error = $editSection.querySelector("#error");

    // Seleccionar el option correspondiente de la lista
    $selectContactList.selectedIndex = selectedIndex;

    // Menejar el "onchange" del select
    $selectContactList.addEventListener("change", () => {
      contact = this.contactsData.find((c) => c.tel === $selectContactList.value);
      console.log("cs", contact);
      this.renderEditSection(contact);
    });

    // Si se pulsa cancelar, simplemente se renderiza de nuevo la sección "Listar"
    $cancelButton.addEventListener("click", () => this.render(SECTIONS.LIST));

    // Si se pulsa guardar, guardar los cambios
    $saveButton.addEventListener("click", () => {
      // Comprobar si se está editando algún contacto antes de guardar
      if (!contact) {
        $error.textContent = "No se ha seleccionado ningún contacto";
        return;
      }

      // Si el telefono existe (y no es del contacto que se está modificando acualmente)
      // mostrar error
      if (this.telExists(contact.tel) && this.contactsData.some((c) => c.tel === $tel.value.trim() && c !== contact)) {
        $error.textContent = "El telefono introducido ya existe en la agenda";
        return;
      }

      this.handleAddClick($name, $surname, $address, $tel, $error, contact, "update");
    });
  }

  /**********************************************************************************************************
   * Manejador para el botón "Guardar", tanto para la sección "Añadir" como "Editar"
   * action puede ser "add" o "update"
   **********************************************************************************************************/
  handleAddClick($name, $surname, $address, $tel, $error, contact, action = "add") {
    const name = $name.value.trim();
    const surname = $surname.value.trim();
    const address = $address.value.trim();
    const tel = $tel.value.trim();
    const newContact = { name, surname, address, tel };

    $error.textContent = "";
    $name.focus();

    if (name === "" || surname === "" || address === "" || tel === "") {
      $error.textContent = "Rellena todos los campos imbécil";
      return;
    }

    // Si el telefono a añadir ya existe al añadir mostrar error
    // Y si el telefono a actualizar ya existe y no es el que se está actualizando mostrar error
    if (this.telExists(tel) && (action === "add" || (action === "update" && tel !== contact.tel))) {
      $error.textContent = "El teléfono ya existe en la agenda.";
      return;
    }

    let newContactsData = this.contactsData;

    // Si la accion es actualizar, se crea un nuevo array temporal con todos
    // los elementos excepto el nuevo
    if (action === "update") {
      newContactsData = this.contactsData.filter((c) => c.tel !== contact.tel);
    }

    newContactsData.push(newContact);

    this.contactsData = newContactsData;

    // Guardar el en el localStorage
    localStorage.setItem(KEY_AGENDA, JSON.stringify(newContactsData));

    if (action === "add"){
      $error.textContent = "Contacto añadido correctamente";
      setTimeout(() => {
        this.render(SECTIONS.ADD)
      }, 500)
    }
    else {
      $error.textContent = "Contacto modificado correctamente";
      setTimeout(() => {
        this.render(SECTIONS.EDIT)
      }, 500)      
    }
  }

  /**********************************************************************************************************
   * Comprueba si ya existe un teléfono en la agenda
   **********************************************************************************************************/
  telExists(tel) {
    return this.contactsData.some((contact) => contact.tel === tel);
  }
}