import React, { Component } from 'react';
import axios from 'axios';
import { Table, Button, Row, Col,
  Card, CardBody,
  CardTitle, ListGroup, ListGroupItem} from 'reactstrap';

class App extends Component {

  state = {
    purchases:[],
    loans:[],
    currentLoan:0
  }

  curr_formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  })

 
  componentWillMount(){

    axios.get('http://localhost:5000/loan').then((response) => {
      this.setState({
        loans: response.data.loans
      })
    })


  }
  
  renderPurchases(){
    let purchases = this.state.purchases.map((purchase) => {
      return (
        <tr key={purchase.id}>
          <td>{purchase.investor_name}</td>
          <td>{purchase.amount}</td>
          <td>{((purchase.amount/this.state.currentLoan.total)*100).toFixed(1)}</td>
          <td>
            <Button color="success" size="sm" className="mr-2">Edit</Button>{' '}
            <Button color="danger" size="sm" className="mr-2">Delete</Button>{' '}
          </td>
        </tr>
      )
    });

    return (
      <tbody>
            {purchases}
      </tbody>
    )
  }

  renderLoans(){
    let loans = this.state.loans.map((loan) => {
      return (
        <ListGroupItem key={loan.id} onClick={this.load_purchases.bind(this, loan.id)}>
          <div className="clearfix">
            <div className="float-left">
              <Row>Product ID</Row>
              <Row>{loan.product_id}</Row>
            </div>
            <div className="float-right">
              <Row className="text-right">Advance</Row>
              <Row className="text-right">{loan.advance_date.substring(0,10)}</Row>
            </div>
          </div>
          <Row>
            <Col className="text-right">
              {this.curr_formatter.format(loan.total)}
            </Col>
          </Row>
        </ListGroupItem>
      )
    });

    return(
        <Card>
            <CardBody>
              <CardTitle>Select a product to syndicate</CardTitle>
              
              <ListGroup>
                {loans}
              </ListGroup>
              <div className="text-center" style={{ padding: '.5rem' }}>
                <button className="btn btn-info mr-2">Close</button>
                <button className="btn btn-info mr-2">Sell all</button>
              </div>
            </CardBody>
          </Card>
    )
  }

  renderCreateMessage(){
    return(
      <tbody><tr><td>Add a new purchase clicking the + button</td></tr></tbody>
    )
  }

  renderTableBody(){
    if (this.state.currentLoan){
      console.log(this.state.currentLoan.purchases.length)
      if (this.state.currentLoan.purchases.length>0){
          return this.renderPurchases()
        } 
      }
        return this.renderCreateMessage()
    
  }

  render() {
    return (
      <div className="App container">
        <Row>
          <Col></Col>
          <Col>APPLICATION</Col>
          <Col>SEARCH</Col>
          <Col>QA</Col>
          <Col>DASHBOARD</Col>
          <Col>USER ADMIN</Col>
          <Col>ADMIN</Col>
        </Row>
        <Row>
          <Col md="4" lg="4">
          {this.renderLoans()}
          </Col>
          <Col md="8" lg="8">
            Product ID {this.state.currentLoan.product_id}
          <Table>
          <thead>
            <tr>
              <th>Investor name</th>
              <th>Sold</th>
              <th>% Purchased</th>
              <th></th>
            </tr>
          </thead>
          {this.renderTableBody()}
        </Table>
          </Col>
        </Row>
        <Row >
          <Col className="text-center small">&copy; LendingFront 2016</Col>
        </Row>
      </div>
    );  
  }

  load_purchases(loan_id){
    axios.post('http://localhost:5000/purchase/'+loan_id).then((response) => {
      this.setState({
        purchases: response.data.purchases
      })
    })

    axios.get('http://localhost:5000/loan/'+loan_id).then((response) => {
      this.setState({
        currentLoan: response.data.loan
      })
    })
  }
}

export default App;
