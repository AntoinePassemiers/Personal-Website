---
layout: ../../../layouts/PostLayout.astro
title: A quick and comprehensive introduction to Ethereum
description: Ethereum - A cryptocurrency, but not only
date: 2026-06-13
author: Antoine Passemiers
lang: en
tag: Crypto
---

TODO

- Gas (is Remix actually good at estimating gas consumption?)
- `library` keyword to make libraries stateless -> prevent vulnerabilities
- ERC-1967 proxy to move the contract's logic to another address. Allows changing the code or fixing bugs over time: https://eips.ethereum.org/EIPS/eip-1967. Storage slot for the implementation contract address is hardcoded (derived from a hash) to prevent any collision with other variables in the code.