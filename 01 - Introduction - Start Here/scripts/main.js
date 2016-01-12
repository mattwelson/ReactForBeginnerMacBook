var React = require('react');
var ReactDom = require('react-dom');
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var Navigation = ReactRouter.Navigation;
var History = ReactRouter.History;
var createBrowserHistory = require('history/lib/createBrowserHistory');
var h = require('./helpers');

// App
var App = React.createClass({
  getInitialState: function(){
    return {
      fishes: {},
      order: {}
    };
  },
  addFish: function(fish){
    var timestamp = (new Date()).getTime();

    this.state.fishes['fish-' + timestamp] = fish;

    this.setState({fishes : this.state.fishes});
  },
  addToOrder: function(key){
    this.state.order[key] = this.state.order[key] + 1 || 1;

    this.setState({order: this.state.order});
  },
  loadSamples: function(){
    this.setState({
      fishes: require('./sample-fishes')
    });
  },
  renderFish: function(key){
      return (
        <Fish key={key} index={key} details={this.state.fishes[key]} addToOrder={this.addToOrder}/>
      );
  },
  render: function(){
    return (
      <div className="catch-of-the-day">
        <div className="menu">
          <Header tagline="Fresh Seafood Market"></Header>
          <ul className="list-of-fishes">
            {Object.keys(this.state.fishes).map(this.renderFish)}
          </ul>
        </div>
        <Order fishes={this.state.fishes} order={this.state.order}></Order>
        <Inventory addFish={this.addFish} loadSamples={this.loadSamples}></Inventory>
      </div>
    );
  }
});

var Fish = React.createClass({
  addToOrder: function(){
    this.props.addToOrder(this.props.index);
  },
  render: function(){
    var details = this.props.details;
    var isAvailable = details.status === 'available';
    var buttonText = isAvailable ? 'Add to order' : 'Sold out!';
    return (
      <li className="menu-fish">
        <img src={details.image} alt={details.name} />
        <h3 className="fish-name">
          {details.name}
          <span className="price">{h.formatPrice(details.price)}</span>
        </h3>
        <p>{details.desc}</p>
        <button disabled={!isAvailable} onClick={this.addToOrder}>{buttonText}</button>
      </li>
    );
  }
});

// AddFishForm
var AddFishForm = React.createClass({
  createFish:function(e){
    e.preventDefault();

    var fish = {
      name : this.refs.name.value,
      price : this.refs.price.value,
      status : this.refs.status.value,
      desc : this.refs.desc.value,
      image : this.refs.image.value
    };

    this.props.addFish(fish);

    this.refs.fishForm.reset();
  },
  render:function(){
    return (
      <form action="" className="fish-edit" onSubmit={this.createFish} ref='fishForm'>
        <input type="text" ref="name" placeholder="Fish name" />
        <input type="text" ref="price" placeholder="Fish price" />
        <select ref="status">
          <option value="available">Fresh!</option>
          <option value="unavailable">Sold Out!</option>
        </select>
        <textarea type="text" ref="desc" placeholder="Description"></textarea>
        <input type="text" ref="image" placeholder="URL to image" />
        <button type="submit">+ Add item</button>
      </form>
    );
  }
});

// Header
var Header = React.createClass({
  render:function(){
    return (
      <header className="top">
        <h1>Catch
          <span className="ofThe">
            <span className="of">of</span>
            <span className="the">the</span>
          </span>
        day</h1>
        <h3 className="tagline">
          <span>
            { this.props.tagline }
          </span>
        </h3>
      </header>
    );
  }
});

// Order
var Order = React.createClass({
  renderOrder: function(key){
    var fish = this.props.fishes[key];
    var count = this.props.order[key];

    if (!fish){
      return (
        <li key={key}>
          Sorry, fish no longer available
        </li>
      );
    }

    return (
      <li key={key}>
        {count}lbs
        {fish.name}
        <span className="price">{h.formatPrice(count * fish.price)}</span>
      </li>
    );
  },
  render:function(){
    var orderIds = Object.keys(this.props.order);
    var total = orderIds.reduce((prevTotal, key) => {
      var fish = this.props.fishes[key];
      var count = this.props.order[key];
      var isAvailable = fish && fish.status === 'available';

      if (fish && isAvailable){
        return prevTotal + (count * parseInt(fish.price) || 0);
      }
      return prevTotal;
    }, 0);
    return (
      <div className="order-wrap">
        <h2 className="order-title">Order</h2>
        <ul className="order">
          { orderIds.map(this.renderOrder)}
          <li className="total">
            <strong>Total:</strong>
            { h.formatPrice(total) }
          </li>
        </ul>
      </div>
    );
  }
});

// Inventory
var Inventory = React.createClass({
  render:function(){
    return (
      <div>
        <h2>Inventory</h2>
        <AddFishForm {...this.props}></AddFishForm>
        <button onClick={this.props.loadSamples}>Load sample fishes</button>
      </div>
    );
  }
});

// Store picker
var StorePicker = React.createClass({
  mixins: [History],
  goToStore: function(e){
    e.preventDefault();
    // get data from input
    var storeId = this.refs.storeId.value;
    // transition to App
    this.history.pushState(null, '/store/' + storeId);
  },
  render: function(){
    return (
      <form className="store-selector" onSubmit={this.goToStore}>
        <h2>Please enter a store</h2>
        <input type="text" ref="storeId"
          defaultValue={h.getFunName()}
          required />
        <input type="Submit" />
      </form>
    );
  }
});

// 404
var NotFound = React.createClass({
  render: function(){
    return (
      <h1>Not found</h1>
    );
  }
});

// Routes
var routes = (
  <Router history={createBrowserHistory()}>
    <Route path='/' component={ StorePicker } />
    <Route path='/store/:storeId' component={ App } />
    <Route path='*' component={NotFound}></Route>
  </Router>
);

ReactDom.render(
  routes,
  document.querySelector('#main')
);
