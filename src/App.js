import React, { Component } from 'react';
import axios from 'axios';
import { Table, Button, Row, Col,
  Card, CardBody, Form, FormGroup,
  CardTitle, ListGroup, ListGroupItem,
  Label, Input, Navbar, NavbarBrand, NavItem,
  NavLink, UncontrolledDropdown, DropdownToggle } from 'reactstrap';
import { properties } from './properties.js';
import './App.sass';
import logo from './logo.png';

class App extends Component {


  
  constructor(){
    super();
    this.state = {
          purchases:[],
          loans:[],
          currentLoan:0,
          currentRemainingAmount:0,
          editPurchaseId:0,
          isEditActive: false,
          isLoanSelected: false,
          editPurchaseData:{
            investor_name: 'Y Combinator',
            amount: 0,
            loan_id: 0
          }
        }
        
        this.investors = ['Combinator Y', 'SaaS org', 'General Electric']
        this.curr_formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        })
  }

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
          <td>${purchase.amount}</td>
          <td>{((purchase.amount/this.state.currentLoan.total)*100).toFixed(1)}</td>
          <td>  
            <div>
              <Button size="sm" className="btn mr-1 roundedBtn secondary" onClick={this.toggleEditView.bind(this, purchase.id)}>Edit</Button>{' '}
              <Button size="sm" className="btn mr-1 roundedBtn outline"onClick={this.deletePurchase.bind(this, purchase.id)}>Delete</Button>{' '}
            </div>       
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
    let loanItemClass = this.state.isLoanSelected? "activeLoanItem":"inactiveLoanItem"
    let loans = this.state.loans.map((loan) => {
      return (
        <ListGroupItem key={loan.id} onClick={this.load_purchases.bind(this, loan.id)} className={loanItemClass}>
          <div className="clearfix">
            <div className="float-left">
              <Row className="product">Product ID</Row>
              <Row>{loan.product_id}</Row>
            </div>
            <div className="float-right">
              <Row className="text-right advance">Advance</Row>
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
              <CardTitle className="loanHeader">Select a product to syndicate</CardTitle>
              
              <ListGroup>
                {loans}
              </ListGroup>
              <div className="text-center" style={{ padding: '.5rem' }}>
                <button className="btn mr-2 roundedBtn">Close</button>
                <button className="btn mr-2 roundedBtn">Sell</button>
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
        <Row className="tableFooter">
          <Col md="12">Remaining amount ${this.state.currentRemainingAmount} of ${this.state.currentLoan.total}</Col>
          <Col md="12">{((this.state.currentRemainingAmount/this.state.currentLoan.total)*100).toFixed(1)}%</Col>
        </Row>
      )
    }
  }

  renderActions(){
    if (this.state.editPurchaseId===0){
      return(
        <div>
          <Button className="btn mr-1 roundedBtn secondary" onClick={this.savePurchase.bind(this)}>Save</Button>
          <Button className="btn mr-1" close />
        </div>
      )
    } else{
      return(
        <div>
          <Button className="btn mr-1 roundedBtn secondary" onClick={this.editPurchase.bind(this)}>Save</Button>
          <Button className="btn mr-1 roundedBtn outline" onClick={this.deletePurchase.bind(this,this.state.editPurchaseId)}>Delete</Button>
        </div>
      )
    }
  }
  
  renderContent(){
    if(this.state.isEditActive){
      return(
        <div className="editPurchase">
          <Row>
            Add new purchase
          </Row>
          <Row>
          <Col className="text-center"><Label for="amountToSell" className="mr-sm-2">Amount to sell</Label></Col>
          </Row>
          <Row>
          <Form inline>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
            <Input type="select" name="investorName" id="investorName"  value={this.state.editPurchaseData.investor_name} onChange={(e) => {
                let {editPurchaseData} = this.state;
                editPurchaseData.investor_name = e.target.value;
                editPurchaseData.loan_id = this.state.currentLoan.id
                this.setState({editPurchaseData})
              }}>
              <option value="Y Combinator" defaultValue>Y Combinator</option>
              <option value="SaaStr">SaaStr</option>
              <option value="IndieGo">IndieGo</option>
            </Input>
            </FormGroup>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
              <Input type="number" name="amountToSell" id="amountToSell" value={this.state.editPurchaseData.amount} onChange={(e) => {
                let {editPurchaseData} = this.state;
                editPurchaseData.amount = e.target.value;
                editPurchaseData.loan_id = this.state.currentLoan.id
                this.setState({editPurchaseData})
              }}/>
            </FormGroup>
            {this.renderActions()}
          </Form>
          </Row>
        </div>
      )
    }
     else{
      return(
        <Table hover>
            <thead className="purchaseHeader">
              <tr>
                <th scope="row">Investor name</th>
                <th scope="row">Sold</th>
                <th scope="row">% Purchased</th>
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

  renderAddPurchaseButton(){
    if(this.state.currentLoan!==0){
      return(
        <Button className="addPurchaseButton" onClick={this.toggleEditView.bind(this,0)}>+</Button>
      )
    }
  }

  render() {
    return (
      <div className="App container">
        <Row>
          <Navbar className="navBar" light expand="md">   
          < NavbarBrand href="/"><img src={logo} alt="B"/></NavbarBrand>
            <NavItem>
              <NavLink className="navLink" href="/">APPLICATION</NavLink>
            </NavItem>
            <NavItem>
              <NavLink className="navLink" href="/">SEARCH</NavLink>
            </NavItem>
            <NavItem>
              <NavLink className="navLink" href="/">QA</NavLink>
            </NavItem>
            <NavItem style={{float: "right"}}>
              <NavLink className="navLink" href="/">DASHBOARD</NavLink>
            </NavItem>
            <NavItem>
              <NavLink className="navLink" href="/">USER ADMIN</NavLink>
            </NavItem>
            <UncontrolledDropdown nav inNavbar >
              <DropdownToggle nav caret className="navAdmin">
                ADMIN
              </DropdownToggle>
            </UncontrolledDropdown>
         </Navbar>
        </Row>
        <Row>
          <Col>
          <header><h3 style={{color:"white", fontWeight:200}}>Advances for syndication</h3></header>
          </Col>
        </Row>
        <Row>
          <Col md="4" lg="4" className="leftBlock">
          {this.renderLoans()}
          </Col>
          <Col md="8" lg="8" className="rightBlock">
            <Row className="purchaseHeader" style={{height:"40px", padding: "2px"}}>
              <Col md="5">Product ID {this.state.currentLoan.product_id}</Col>
              <Col></Col>
              <Col md="2">{this.renderAddPurchaseButton()}</Col>
            </Row>
          {this.renderContent()}
          {this.renderCurrentRemainingAmount()}
          </Col>
        </Row>
        <Row >
          <Col>
          <footer className="text-center text-muted">&copy; LendingFront 2016</footer>
          </Col>
        </Row>
      </div>
    );  
  }

  load_purchases(loan_id){
    this.toggleLoanStyle()
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

  toggleEditView(purchaseId){
    this.setState({
      isEditActive: !this.state.isEditActive,
      editPurchaseId: purchaseId
    })
  }

  toggleLoanStyle(){
    this.setState({
      isLoanSelected: !this.state.isLoanSelected
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

  savePurchase(){
    axios.post(properties.backendServer+'purchase', this.state.editPurchaseData).then((response) => {
      let {purchases} = this.state;
      purchases.push(response.data.purchase);
      console.log(response.data.purchase)
      this.setState({purchases, editPurchaseData:{
        investor_name: 'Y Combinator',
        amount: 0,
        loan_id: 0
      }})
    })    
    this.toggleEditView()
  }
  
  async editPurchase(){
      await axios.put(properties.backendServer+'purchase/'+this.state.editPurchaseId, this.state.editPurchaseData);
        this.setState({editPurchaseId:0,editPurchaseData:{
          investor_name: 'Y Combinator',
          amount: 0,
          loan_id: 0
        }})
        this.load_purchases(this.state.currentLoan.id)
        this.toggleEditView()
  }

  async deletePurchase(purchaseId){
    console.log(purchaseId)
    if(purchaseId!==0){
      await axios.delete(properties.backendServer+'purchase/'+purchaseId);
      this.load_purchases(this.state.currentLoan.id)
      if(this.state.isEditActive) {this.toggleEditView(0)}
    }
  }
}

export default App;
