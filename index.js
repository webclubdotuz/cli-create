'use strict'
const fs = require('fs')
const readline = require('readline')
const stream = require('stream')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const questions = {
  'Названия файла папки': (nameCatalog, history) => {
    if (nameCatalog)
      fs.mkdir(nameCatalog, (err) => {
        if (err) throw err
        history.name = nameCatalog
      })
  },
  'Названия файла': (listFiles, history) => {
    listFiles.split(' ').forEach((fileName) => {
      fileName = fileName.trim()
      history.files.push(fileName)
      fs.writeFile(history.name + '/' + fileName, '', (err) => {
        if (err) throw err
      })
    })
  },
}

const createQuestion = (theQuestion) => {
  return new Promise((resolve, reject) => {
    try {
      rl.question(theQuestion + ': ', (theAnswer) => resolve(theAnswer))
    } catch (err) {
      reject(err)
    }
  })
}

const start = async () => {
  let history = { name: '', files: [] }

  for await (let [key, taskFn] of Object.entries(questions)) {
    const answer = await createQuestion(key)
    taskFn(answer, history, rl)
  }

  const readFile = fs.createReadStream('./history/history.json', 'utf8')

  readFile.on('data', (chunk) => {
    fs.writeFile(
      './history/history.json',
      JSON.stringify([...JSON.parse(chunk), history]),
      (err, data) => {
        if (err) {
          console.error(err)
          return
        }
      }
    )
  })

  rl.close()
}

start()
