import { useState } from 'react'
import { Form, Button, Row, Col, Container} from 'react-bootstrap';
import './App.css';


export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })

  async function onChange(e) {
    console.log("onChange !")
  }
  async function createMarket() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    data.stringify() /*  !!!!!!!!!!!!       LIGNE A SUPP           LIGNE A SUPP        LIGNE A SUPP               LIGNE A SUPP !!!!!!!!!!!!!!!!  */
    try {
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }


  return (
    <Container>
        <Row className="show-grid">
            <Col xs={1} md={4}>
            </Col>
            <Col xs={4} md={4}>
            <Form>
                <Form.Group className="mb-3" >
                    <Form.Control type="name" placeholder="Asset Name" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                  <Form.Control as="textarea" rows={3} placeholder="Asset Description"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicNumber">
                    <Form.Control type="number" placeholder="Asset Price in Eth" />
                </Form.Group>
                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label>Character file</Form.Label>
                  <Form.Control type="file" />
                </Form.Group>
                <Button className ="createButton" variant="primary" type="submit">
                Create Item
                </Button>
            </Form>
            </Col>
            <Col xs={1} md={4}>
            </Col>
            {setFileUrl}{updateFormInput}{onChange}{createMarket}
        </Row>
    </Container>
  )
}