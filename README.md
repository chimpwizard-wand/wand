# Wand

```yaml
by: иÐгü
email: ndru@chimpwizard.com
date: 03.07.2019
version: in-progress
```

---

This wand/cli is inspired and forked from meta cli.

WHen working with microservices developers have a challenge of dealing with multiple small repos. There is a controversy arround what it is better, one biug repo with all your microservices and leave the automation to deal with the process of spliting the pieces or deal with multiple microservices.

I believe the latter is the better, it encourage decoupling as well facilitates the git repo managementment. Branching and merging is much more simple.

## Available spells

- solution: This scafold an application based on a predefined stack.
- github: Wrapper over github API.
- vault: Secret management available for other spells that might need to access secrets/passwords variables.
- spells: Easy way to install spells

## Prerequisites to run the code

- install [npm](https://docs.npmjs.com/getting-started/what-is-npm)

## Quickstart

First you need to install the cli

```shell
npm install -g @chimpwizard/wand
```

Then lets also install all the core spells

```shell
wand spell install --all
```

Lets start a new application from scratch using [simple](https://github.com/chimpwizard-stacks-simple) stack one of our predefined stacks.

```sh
wand solution create wanddemo [--org wanddemo] [--stack simple]
cd WandDemo
```

This stack creates the following structure

```schetch
wanddemo
|
|- www (based on the elastic-ui)
|- api    (api/gateway)
   |
   |- data store microseervice (generic mongodb microservices)
   |- config microservice (generic config management microservices)
   .
   |- n-microservices cerated thru cli
   .
   .
|- proxy (traefik proxy for local development)
|- chart (helm chart for the application)

```

Now lets create a model, model files can be created on small pieces to match each microservices or as a whole holistic view of the system. Lets start simple

The modeel sintax came from the [nomnoml](http://nomnoml.com) framework.

The complete model looks like this:

```js
[Pirate|
  knownAs: string;
  firstName;
  lastName;
  dob;
  eyeCount: int
]
[Pirate] bornIn -> [Country]
[Pirate] captured -> 0..* [Ship]


[Country|
  name
]

[Ship|
  name;
  speed
]
[Ship] ->[Country]
```

But we will create small ones to runt he microservice generator initially.

> NOTE: Types can be specified. If not specified the generator will use AI to determine which type makes more sense. There are elso a built-in more human friendly types created eg email, money, address, location, etc..

Then run the cli to create the the different microservice

```sh
wand component add people --from-model pirate.model
wand component add people --from-model ship.model
wand component add people --from-model country.model
```
