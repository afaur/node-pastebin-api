const axios    = require('axios')
const FormData = require('form-data')
const settings = require('./config/settings.json')

function sleep(time) {
  const ms = time * 1000
  return new Promise(res => { setTimeout(() => res(), ms) })
}

async function createKey() {
  return new Promise((res, rej) => {
    let data = new FormData()

    const params = {
      api_dev_key:       `${settings['devKey'].trim()}`,
      api_user_name:     `${settings['username'].trim()}`,
      api_user_password: `${settings['password'].trim()}`,
    }

    Object.keys(params).forEach(key => data.append(key, params[key]))

    const url     = "https://pastebin.com/api/api_login.php"
    const headers = { "Content-Type": `multipart/form-data; boundary=${data._boundary}` }
    const options = { method: 'POST', url, headers, data }

    axios(options)
      .then(function (response) { return res(response.data) })
      .catch(function (error)   { return rej(error)         })
  })
}

async function createPaste(userKey, name) {
  return new Promise((res, rej) => {
    let data = new FormData()

    const params = {
      api_option:            `paste`,
      api_user_key:          `${userKey.trim()}`,
      api_dev_key:           `${settings['devKey'].trim()}`,
      api_paste_name:        `${name.trim()}`,
      api_paste_code:        `{ "key": "Test" }`,
      api_paste_private:     `2`,
      api_paste_expire_date: `10M`,
      api_paste_format:      `json`,
    }

    Object.keys(params).forEach(key => data.append(key, params[key]))

    const url     = "https://pastebin.com/api/api_post.php"
    const headers = { "Content-Type": `multipart/form-data; boundary=${data._boundary}` }
    const options = { method: 'POST', url, headers, data }

    axios(options)
      .then(function (response) {
        const pasteUrl = response.data.trim()
        if (/\w\/(.*)$/.test(pasteUrl)) {
          const pasteKey = /\w\/(.*)$/.exec(response.data)[1].trim()
          return res({ pasteKey, pasteUrl })
        }
        return rej('No pasteKey returned from endpoint.')
      })
      .catch(function (error) { return rej(error) })
  })
}

async function deletePaste(userKey, pasteKey) {
  return new Promise((res, rej) => {
    let data = new FormData()

    const params = {
      api_option:            `delete`,
      api_user_key:          `${userKey.trim()}`,
      api_dev_key:           `${settings['devKey'].trim()}`,
      api_paste_key:         `${pasteKey.trim()}`,
    }

    Object.keys(params).forEach(key => data.append(key, params[key]))

    const url     = "https://pastebin.com/api/api_post.php"
    const headers = { "Content-Type": `multipart/form-data; boundary=${data._boundary}` }
    const options = { method: 'POST', url, headers, data }

    axios(options)
      .then(function (response) { return res(response.data) })
      .catch(function (error)   { return rej(error)         })
  })
}

(async function() {
  const userKey = await createKey()
  const { pasteKey, pasteUrl } = await createPaste(userKey, "test")
  console.log("Created paste: ", pasteUrl)
  console.log("Paste key: ", pasteKey)
  await sleep(1)
  const result = await deletePaste(userKey, pasteKey)
  console.log(result)
})()
