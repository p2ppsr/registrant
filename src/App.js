import React, { useState, useEffect } from 'react'
import { ProtoMap, ConfederacyConfig as ProtomapConfederacyConfig } from 'babbage-protomap'
import { BasketMap, ConfederacyConfig as BasketmapConfederacyConfig } from 'basketmap'
import { CertMap, ConfederacyConfig as CertmapConfederacyConfig } from 'certmap'
import { Signia, ConfederacyConfig as SigniaConfederacyConfig } from 'babbage-signia'
import { getPublicKey, getNetwork } from '@babbage/sdk-ts'

const App = () => {
  const [confederacyHost, setConfederacyHost] = useState('https://confederacy.babbage.systems')
  const [myPublicKey, setMyPublicKey] = useState('---')
  const [myProtocols, setMyProtocols] = useState([])
  const [myBaskets, setMyBaskets] = useState([])
  const [myCertTypes, setMyCertTypes] = useState([])
  const [myCounterparties, setMyCounterparties] = useState([])

  const protomap = new ProtoMap(new ProtomapConfederacyConfig(
    confederacyHost,
    [1, 'protomap'],
    '1',
    1000,
    ['ProtoMap'],
    undefined,
    undefined,
    false,
    false,
    'localToSelf'
  ))

  const basketmap = new BasketMap(new BasketmapConfederacyConfig(
    confederacyHost,
    [1, 'basketmap'],
    '1',
    1000,
    ['BasketMap'],
    undefined,
    undefined,
    false,
    false,
    'localToSelf'
  ))

  const certmap = new CertMap(new CertmapConfederacyConfig(
    confederacyHost,
    [1, 'certmap'],
    '1',
    1000,
    ['CertMap'],
    undefined,
    undefined,
    false,
    false,
    'localToSelf'
  ))

  const signia = new Signia(new SigniaConfederacyConfig(
    confederacyHost,
    [1, 'signia'],
    '1',
    1000,
    ['Signia'],
    undefined,
    undefined,
    false,
    false,
    'localToSelf'
  ))

  useEffect(() => {
    (async () => {
      const publicKey = await getPublicKey({ identityKey: true })
      setMyPublicKey(publicKey)
      const network = await getNetwork()
      if (network === 'testnet') {
        setConfederacyHost('https://staging-confederacy.babbage.systems')
      }
      const protocols = await protomap.listOwnRegistryEntries()
      setMyProtocols(protocols)
      const baskets = await basketmap.listOwnRegistryEntries()
      setMyBaskets(baskets)
      const certTypes = await certmap.listOwnRegistryEntries()
      setMyCertTypes(certTypes.map(x => ({
        ...x,
        fields: JSON.parse(x.fields)
      })))
      const counterparties = await signia.listCertifiedPeers()
      setMyCounterparties(counterparties)
    })()
  }, [])

  const registerProtocol = async () => {
    const securityLevel = Number(window.prompt('Enter the security level'))
    const protocolID = window.prompt('Enter the protocol ID')
    const name = window.prompt('Enter the friendly name')
    const iconURL = window.prompt('Enter the icon URL')
    const description = window.prompt('Enter the protocol description')
    const documentationURL = window.prompt('Enter the documentation URL')
    await protomap.registerNewProtocol(
      securityLevel,
      protocolID,
      name,
      iconURL,
      description,
      documentationURL
    )
    setMyProtocols(p => ([...p, {
      securityLevel,
      protocolID,
      name,
      iconURL,
      description,
      documentationURL
    }]))
  }

  const revokeProtocol = p => async () => {
    await protomap.revokeOwnRegistryEntry(p)
    const myProtocolsCopy = [...myProtocols]
    const indexToDelete = myProtocolsCopy.indexOf(p)
    myProtocolsCopy.splice(indexToDelete, 1)
    setMyProtocols(myProtocolsCopy)
  }

  const registerBasket = async () => {
    const basketID = window.prompt('Enter the basket ID')
    const name = window.prompt('Enter the friendly name')
    const iconURL = window.prompt('Enter the icon URL')
    const description = window.prompt('Enter the basket description')
    const documentationURL = window.prompt('Enter the documentation URL')
    await basketmap.registerNewBasket(
      basketID,
      name,
      iconURL,
      description,
      documentationURL
    )
    setMyBaskets(b => ([...b, {
      basketID,
      name,
      iconURL,
      description,
      documentationURL
    }]))
  }

  const revokeBasket = b => async () => {
    await basketmap.revokeOwnRegistryEntry(b)
    const myBasketsCopy = [...myBaskets]
    const indexToDelete = myBasketsCopy.indexOf(b)
    myBasketsCopy.splice(indexToDelete, 1)
    setMyBaskets(myBasketsCopy)
  }

  const registerCertType = async () => {
    const certType = window.prompt('Enter the certificate type')
    const name = window.prompt('Enter the friendly name')
    const iconURL = window.prompt('Enter the icon URL')
    const description = window.prompt('Describe the certificate in a few words')
    const documentationURL = window.prompt('Enter the documentation URL')
    const fields = {}
    while (true) {
      const key = window.prompt('Enter the name of a field')
      const friendlyName = window.prompt(`Enter the friendly name of the ${key} field`)
      const description = window.prompt(`Enter the description of the ${key} field`)
      const type = window.prompt(`Enter the type of the ${key} field ('text-0-to-30-characters' | 'text-30-to-100-characters' | 'text-over-100-characters' | 'image-url-https' | 'image-url-uhrp' | 'other')`)
      const fieldIcon = window.prompt(`Enter icon URL for ${key} field`)
      fields[key] = {
        friendlyName,
        description,
        type,
        fieldIcon
      }
      const addMore = window.prompt('Add a new field? [y/n]')
      if (addMore.toLowerCase() === 'n') {
        break
      }
    }
    await certmap.registerNewCertificateType(
      certType,
      name,
      iconURL,
      description,
      documentationURL,
      fields
    )
    setMyCertTypes(c => ([...c, {
      certType,
      name,
      iconURL,
      description,
      documentationURL,
      fields
    }]))
  }

  const revokeCertType = c => async () => {
    await certmap.revokeOwnRegistryEntry(c)
    const myCertTypesCopy = [...myCertTypes]
    const indexToDelete = myCertTypesCopy.indexOf(c)
    myCertTypesCopy.splice(indexToDelete, 1)
    setMyCertTypes(myCertTypesCopy)
  }

  const registerCounterparty = async () => {
    const counterparty = window.prompt('Enter the entity public key')
    const name = window.prompt('Enter the entity name')
    const icon = window.prompt('Enter the entity icon URL')
    await signia.certifyPeer(
      counterparty,
      {
        name,
        icon
      },
      'YoPsbfR6YQczjzPdHCoGC7nJsOdPQR50+SYqcWpJ0y0='
    )
    setMyCounterparties(c => ([...c, {
      subject: counterparty,
      decryptedFields: {
        name,
        icon
      }
    }]))
  }

  const revokeCounterparty = c => async () => {
    await signia.revokeCertifiedPeer(c)
    const myCounterpartiesCopy = [...myCounterparties]
    const indexToDelete = myCounterpartiesCopy.indexOf(c)
    myCounterpartiesCopy.splice(indexToDelete, 1)
    setMyCounterparties(myCounterpartiesCopy)
  }

  return (
    <center style={{ margin: '1em' }}>
      <h1>Registrant</h1>
      <h2>Confederacy Host</h2>
      <input
        type='text'
        value={confederacyHost}
        onChange={e => setConfederacyHost(e.target.value)}
        placeholder='Confederacy Host'
        style={{
          minWidth: '30em'
        }}
      />
      <h2>Registry Operator</h2>
      <p>{myPublicKey}</p>
      <h2>My Protocols</h2>
      <button onClick={registerProtocol}>Register New Protocol</button>
      {myProtocols.map((p, i) => (
        <div key={i}>
          <p><b>Security level:</b> {p.securityLevel}</p>
          <p><b>Protocol ID:</b> {p.protocolID}</p>
          <p><b>Name:</b> {p.name}</p>
          <p><b>Description:</b> {p.description}</p>
          <p><b>Documentation:</b> <a href={p.documentationURL} target='_blank'>{p.documentationURL}</a></p>
          <p><b>Icon:</b> <a href={p.iconURL} target='_blank'>{p.iconURL}</a></p>
          <button onClick={revokeProtocol(p)}>Revoke</button>
        </div>
      ))}
      <h2>My Baskets</h2>
      <button onClick={registerBasket}>Register New Basket</button>
      {myBaskets.map((b, i) => (
        <div key={i}>
          <p><b>ID:</b> {b.basketID}</p>
          <p><b>Name:</b> {b.name}</p>
          <p><b>Description:</b> {b.description}</p>
          <p><b>Documentation:</b> <a href={b.documentationURL} target='_blank'>{b.documentationURL}</a></p>
          <p><b>Icon:</b> <a href={b.iconURL} target='_blank'>{b.iconURL}</a></p>
          <button onClick={revokeBasket(b)}>Revoke</button>
        </div>
      ))}
      <h2>My Certificate Types</h2>
      <button onClick={registerCertType}>Register New Certificate Type</button>
      {myCertTypes.map((c, i) => (
        <div key={i}>
          <p><b>Certificate Type ID:</b> {c.certType}</p>
          <p><b>Name:</b> {c.name}</p>
          <p><b>Description:</b> {c.description}</p>
          <p><b>Documentation:</b> <a href={c.documentationURL} target='_blank'>{c.documentationURL}</a></p>
          <p><b>Icon:</b> <a href={c.iconURL} target='_blank'>{c.iconURL}</a></p>
          <h3>Fields:</h3>
          {typeof c.fields[Object.keys(c.fields)[0]] === 'object'
            ? <ul>
              {Object.keys(c.fields).map((f, i) => {
                return (
                  <div key={i}>
                    <li key={i}><b>field:</b> {f}</li>
                    <li key={i}><b>friendlyName:</b> {c.fields[f].friendlyName}</li>
                    <li key={i}><b>description:</b> {c.fields[f].description}</li>
                    <li key={i}><b>type:</b> {c.fields[f].type}</li>
                    <li key={i}><b>fieldIcon:</b> {c.fields[f].fieldIcon}</li>
                  </div>
                )
              })}
            </ul>
            : Object.keys(c.fields).map((f, i) => (
              <li key={i}><b>{f}:</b> {c.fields[f]}</li>
            ))
          }

          <button onClick={revokeCertType(c)}>Revoke</button>
        </div>
      ))}
      <h2>Entities</h2>
      <button onClick={registerCounterparty}>Register New Entity</button>
      {myCounterparties.map((c, i) => (
        <div key={i}>
          <p><b>Public Key:</b> {c.subject}</p>
          <p><b>Name:</b> {c.decryptedFields.name}</p>
          <p><b>Icon:</b> <a href={c.decryptedFields.icon} target='_blank'>{c.decryptedFields.icon}</a></p>
          <button onClick={revokeCounterparty(c)}>Revoke</button>
        </div>
      ))}
    </center>
  )
}

export default App
