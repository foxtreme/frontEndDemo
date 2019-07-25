import React, { Component } from 'react';
import axios from 'axios';
import { Table, Button, Row, Col,
  Card, CardBody, Form, FormGroup,
  CardTitle, ListGroup, ListGroupItem,
  Label, Input } from 'reactstrap';
import { properties } from './properties.js';


class App extends Component {

 

  state = {
    purchases:[],
    loans:[],
    currentLoan:0,
    currentRemainingAmount:0,
    isCreateActive: false,
    isDropdownOpen: false
  }

  curr_formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  })

  investors = ['Combinator Y', 'SaaS org', 'General Electric']

  componentWillMount(){

    axios.get(properties.backendServer+'loan').then((response) => {
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
            {this.renderActions()}         
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

  renderActions(){
    return (
      <div>
      <Button color="success" size="sm" className="mr-2">Edit</Button>{' '}
      <Button color="danger" size="sm" className="mr-2">Delete</Button>{' '}
      </div>
    );
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

  renderCurrentRemainingAmount(){
    this.calculateRemaining()
    if (this.state.currentLoan && this.state.purchases){
      return (
        <Row>
          <Col md="12">Remaining amount ${this.state.currentRemainingAmount} of ${this.state.currentLoan.total}</Col>
          <Col md="12">{((this.state.currentRemainingAmount/this.state.currentLoan.total)*100).toFixed(1)}%</Col>
        </Row>
      )
    }
  }
  
  renderContent(){
    if(this.state.isCreateActive){
      return(
        <div>
          <Row>
            Add new purchase
          </Row>
          <Row>
            <Form>
              <Row form>
                <Col md="6">
                  <FormGroup>
                  
                  </FormGroup>
                </Col>
                <Col md="3">
                  <FormGroup>
                  <Label for="amountToSell">Amount to sell</Label>
                  <Input type="number" name="amountToSell" id="amountToSell"/>
                  </FormGroup>
                </Col>
                <Col md="3">
                <Col md="2"><Button color="success" onClick={this.toggleCreateView.bind(this)}>Close</Button></Col>
                </Col>
              </Row>
            </Form>

          </Row>
        </div>
      )
    }else{
      return(
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
      )
    }
  }

  renderTableBody(){
    if (this.state.currentLoan){
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
          <Col>
          <header>Advances for syndication</header>
          </Col>
        </Row>
        <Row>
          <Col md="4" lg="4">
          {this.renderLoans()}
          </Col>
          <Col md="8" lg="8">
            <Row>
              <Col md="10">Product ID {this.state.currentLoan.product_id}</Col>
              <Col md="2"><Button onClick={this.toggleCreateView.bind(this)}>+</Button></Col>
            </Row>
          {this.renderContent()}
          {this.renderCurrentRemainingAmount()}
          </Col>
        </Row>
        <Row >
          <Col className="text-center small">&copy; LendingFront 2016</Col>
        </Row>
      </div>
    );  
  }

  load_purchases(loan_id){
    axios.post(properties.backendServer+'purchase/'+loan_id).then((response) => {
      this.setState({
        purchases: response.data.purchases
      })
    })

    axios.get(properties.backendServer+'loan/'+loan_id).then((response) => {
      this.setState({
        currentLoan: response.data.loan
      })
    })

    this.calculateRemaining()
  }

  toggleCreateView(){
    this.setState({
      isCreateActive: !this.state.isCreateActive
    })
  }

  async calculateRemaining(){
    let amountSpent= 0
    let loan_id = this.state.currentLoan.id
    if(loan_id){
      const updatedResponse = await axios.post(properties.backendServer+'purchase/'+loan_id);
      updatedResponse.data.purchases.forEach(element => {
        amountSpent+= element.amount
      });
      this.setState({
        currentRemainingAmount: this.state.currentLoan.total-amountSpent
      })
    }
  }
}

export default App;
