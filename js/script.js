

  const form = document.querySelector('.form')
  const containerWorkouts = document.querySelector('.workouts')
  let inputType = document.querySelector('.form__input--type')
  let inputDistance = document.querySelector('.form__input--distance')
  let inputDuration = document.querySelector('.form__input--duration')
  let inputCadence = document.querySelector('.form__input--cadence')
  let inputElevation = document.querySelector('.form__input--elevation')

  let map , mapEvent;

  class Workout{
    date = new Date()
    id = (Date.now() + '').slice(-10)

    constructor(coords, distance, duration ){
        this.distance = distance;
        this.duration = duration;
        this.coords = coords;
    }

    _setDescription(){

      const months = [ 'January', 'February', 'March', 'April',
        'May','June', 'July', "August",'September',
        'October', 'November', 'December']

       this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`  //April 14 
    }
  }

  class Running extends Workout{
    type = 'running'
    constructor(coords ,distance, duration ,  cadence){
       super(coords,distance,duration)
        this.cadence = cadence;
        this._calcPace()
        this._setDescription()

    }

    _calcPace(){
        this.pace = this.distance / this.duration
        return this.pace;
       
    }
  }

  class Cycling extends Workout{
    type = 'cycling'
    
    constructor(coords ,distance, duration ,  elevationGain){
       super(coords,distance,duration)
        this.elevationGain = elevationGain;
        this._calcSpeed()
        this._setDescription()

    }

    _calcSpeed(){
        this.speed =this.duration / this.distance ;
        return this.speed;
    }
  }

  class App{

    #map;
    #mapEvent;
    #workouts = []
    constructor(){

        this._getPosition()
         form.addEventListener("submit", this._newWorkout.bind(this))
         inputType.addEventListener('change', this._toggleElevationField)
        }

    _getPosition(){
        if(navigator.geolocation){
           navigator.geolocation.getCurrentPosition
           (this._loadMap.bind(this) ,
             function(){ alert("un known Error")})
            }
            }
    _loadMap(position){
       
            let {latitude} = position.coords;
            let {longitude} = position.coords;
            this.#map = L.map('map').setView([latitude,longitude], 13);

           L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
           }).addTo(this.#map);

          

          this.#map.on('click',this._showForm.bind(this) )

       
    }
    _showForm(mapE){
       
            this.#mapEvent = mapE
            form.classList.remove('hidden')
            inputDistance.focus()
            
    }

    _hideForm(){
      inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

      setTimeout(()=> form.classList.add('hidden'),1000)
    }
    _toggleElevationField(){
        
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
 
    }
    _newWorkout(e){
            e.preventDefault()

            
            let isNumber = (...input) => input.every(el => Number.isFinite(el))  
            let isPositive = (...input) => input.every(el => el>0)
    
            // get data from form
            let wType = inputType.value;
            let wInputDistance = +inputDistance.value;
            let wInputDuration = +inputDuration.value;
            let {lat , lng} = this.#mapEvent.latlng
            let workout ; 
            if(wType == "running"){
              let wInputCadence = +inputCadence.value;

              // check validation
              if(!isNumber(wInputCadence,wInputDistance,wInputDuration) || !isPositive(wInputCadence,wInputDistance,wInputDuration))  return alert('wrong input')  
              workout = new Running([lat , lng],wInputDistance, wInputDuration,wInputCadence)
            }

            if(wType == "cycling"){
              let wInputElevation = +inputElevation.value;

              // check validation
              if(!isNumber(wInputElevation,wInputDistance,wInputDuration ) || !isPositive(wInputElevation,wInputDistance,wInputDuration) )  return alert('wrong input')  

              workout = new Cycling([lat , lng],wInputDistance, wInputDuration,wInputElevation)

            }

            this.#workouts.push(workout)

            this._putWorkoutIcon(workout)

            this._formWorkout(workout)
            this._hideForm();
           
            
        }

    _putWorkoutIcon(workout){
      L.marker(workout.coords).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 400,
                minWidth: 100,
                
                autoClose: false,
                closeOnClick : false,
                className : `${workout.type}__workout`
            }))
            .setPopupContent(`${workout.description}`)
            .openPopup();
    }
    // show workout on list 
    _formWorkout(workout){
      let html = `
              <li class="workout work--${workout.type}" data-id="1234567890">
                  <h2 class="workout__title workout__${workout.type}--title">${workout.description}</h2>
                  <div class="workout__details">
                    <span class="workout_value">${workout.distance}</span>
                    <span class="workout_unit">Km</span>
                  </div>
                  <div class="workout__details">
                   
                    <span class="workout_value">${workout.duration}</span>
                    <span class="workout_unit">min</span>
                  </div>
              `

      if(workout.type == 'running'){
        html += `
                 <div class="workout__details">
                    <span class="workout_value">${workout.cadence}</span>
                    <span class="workout_unit">spm</span>
                  </div> 
                  </li>
        `
      }

      if(workout.type == 'cycling'){
        html += `
                 <div class="workout__details">
                    <span class="workout_value">${workout.elevationGain}</span>
                    <span class="workout_unit">kl</span>
                  </div> 
                  </li>
        `
      }

      form.insertAdjacentHTML('afterend', html)
    }
   

  }

  let app = new App()
 console.log(app)
  //   if(navigator.geolocation){
//     navigator.geolocation.getCurrentPosition(
//         function(position){
//             let {latitude} = position.coords;
//             let {longitude} = position.coords;
//             map = L.map('map').setView([latitude,longitude], 13);

//            L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
//           attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//            }).addTo(map);

          

//          map.on('click', function(mapE){
//             mapEvent = mapE
//             inputDistance.focus()
            
//          })

//         }
//     ,
//     function(){ alert("un known Error")})
//     }

    // form.addEventListener("submit", function(e){
    //     e.preventDefault()

    //     inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
    //     let {lat , lng} = mapEvent.latlng

    //     L.marker([lat,lng]).addTo(map)
    //     .bindPopup(L.popup({
    //         maxWidth: 400,
    //         minWidth: 100,
    //         autoClose: false,
    //         closeOnClick : false
    //     }))
    //     .setPopupContent("hello")
    //     .openPopup();
        
    // })
    
    // inputType.addEventListener('change', function(){
    //     inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
    //     inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    // })