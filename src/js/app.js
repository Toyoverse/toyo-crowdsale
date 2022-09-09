MetaMask = {
    isMetaMaskInstalled: function () {
        if (window.ethereum == undefined) {
            return false;
        } else {
            return true;
        }
    },

    isWalletConnected: false,

    isCorrectNetwork: false,

    connectWallet: function () {
        App.showConnectedWallet(false);
        ethereum
            .request({ method: 'eth_requestAccounts' })
            .then((account) => {
                App.showConnectedWallet(true);
                MetaMask.isWalletConnected = true;
                App.account = account.toString();
                $('.account .wallet-address').html(account);
            }
            )
            .catch((error) => {
                if (error.code === 4001) {
                    // EIP-1193 userRejectedRequest error
                    console.log('Please connect to MetaMask.');
                    App.showConnectedWallet(false);
                    MetaMask.isWalletConnected = false;
                    App.showErrorAlert('Please connect to MetaMask.');
                    App.hideLoadingText();
                    return;
                } else {
                    App.showErrorAlert(error.message);
                }
            });
    },

    switchNetwork: function () {
        ethereum
            .request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: App.validNetwork.ChainId }],
            }).catch((switchError) => {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                    MetaMask.addNetwork();
                }
            })
    },

    addNetwork: function () {
        ethereum
            .request({
                method: 'wallet_addEthereumChain',
                params:
                    [
                        {
                            chainId: App.validNetwork.ChainId,
                            chainName: App.validNetwork.ChainName,
                            nativeCurrency: {
                                name: 'MATIC',
                                symbol: 'MATIC',
                                decimals: 18
                            },
                            rpcUrls: [App.validNetwork.Rpc]
                        }
                    ],
            });
    },

    addToWallet: function () {
        ethereum
            .request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: Contracts.nftTokenAddress,
                        symbol: Contracts.nftTokenContractSymbol,
                        decimals: 0,
                        image: 'https://ipfs.io/ipfs/QmUdDyL22m4wbmshvspLBpysfLPUT7r8dXnZ22Zh6F8SQz',
                    },
                },
            })
            .then((success) => {
                if (success) {
                    console.log('[wallet_watchAsset] NFT added to wallet!')
                } else {
                    console.log('[wallet_watchAsset] Something went wrong.')
                }
            })
            .catch(console.error)
    },
},

    Networks = {
        Ganache: {
            ChainId: '0x539',
            ChainName: 'Ganache',
            Rpc: 'https://127.0.0.1:8545',
            WebSocket: 'ws://127.0.0.1:8545',
            MaticUsdPriceFeed: '0xab594600376ec9fd91f8e885dadf0ce036862de0'
        },
        PolygonMumbai: {
            ChainId: '0x13881',
            ChainName: 'Polygon Mumbai',
            Rpc: 'https://rpc-mumbai.maticvigil.com',
            WebSocket: 'wss://rpc-mumbai.maticvigil.com/ws/v1/46773eb632c11b4d238934422fa21ada3bc0d2ce',
            MaticUsdPriceFeed: '0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada'
        },
        PolygonMainnet: {
            ChainId: '0x89',
            ChainName: 'Polygon Mainnet',
            Rpc: 'https://rpc-mainnet.maticvigil.com',
            WebSocket: 'wss://rpc-mainnet.maticvigil.com/ws/v1/46773eb632c11b4d238934422fa21ada3bc0d2ce',
            MaticUsdPriceFeed: '0xab594600376ec9fd91f8e885dadf0ce036862de0'
        }
    },

    Contracts = {
        nftTokenAddress: '0x07AE3987C679c0aFd2eC1ED2945278c37918816c',
        nftTokenContractSymbol: 'TOYF9',
        nftTokenCrowdsaleAddress: '0x0fB872BA6a28d5195bbAAC2d4649713A7bc5c450'
    },

    App = {
        captchaWidget: null,
        web3Provider: null,
        contracts: {},
        account: '0x0',
        loading: false,
        tokensMinted: 0,
        validNetwork: Networks.PolygonMainnet, // [see: https://docs.metamask.io/guide/ethereum-provider.html#table-of-contents]
        tokenRate: {},
        tokenQuantity: {},
        tokenPurchaseCaps: {},
        tokenTypesForSale: ["6", "7"],
        tokenMaxSupply: {},
        tokenTotalSupply: {},
        tokenTypePauses: {},

        hideMetaMaskButtons() {
            $('#MetaMaskButtons').hide();
        },

        showMetaMaskButtons() {
            $('#MetaMaskButtons').show();
        },

        showConnectedWallet: function (isConnected) {
            if (isConnected) {
                $("#connectButton").hide();
                $("#connectedButton").show();
            } else {
                $("#connectButton").show();
                $("#connectedButton").hide();
            }
        },

        showSuccessAlert(message) {
            $('.alert-container').show();
            $('.alert-success').html(message);
            $('.alert-success').show();
            $('.alert-danger').hide();
        },

        resetAlerts() {
            $('.alert-success').html('');
            $('.alert-danger').html('');
            $('.alert-success').hide();
            $('.alert-danger').hide();
            $('.alert-container').hide();
        },

        showErrorAlert(message) {
            $('.alert-container').show();
            $('.alert-danger').html(message);
            $('.alert-danger').show();
            $('.alert-success').hide();
        },

        isSoldOut(typeId) {
            return App.tokenTotalSupply[typeId] >= App.tokenMaxSupply[typeId];
        },

        checkSoldOut(typeId) {
            var isSoldOut = App.isSoldOut(typeId);
            if (isSoldOut) {
                $('[data-token-type="' + typeId + '"] .buy').hide();
                $('[data-token-type="' + typeId + '"] .buy-disabled').hide();
                $('[data-token-type="' + typeId + '"] .buy-soldout').show();
            }
        },

        disableBuyButtons() {
            $.each(App.tokenTypesForSale, function (index, typeId) {
                App.disableBuyButton(typeId);
            });
        },

        enableBuyButtons() {
            $.each(App.tokenTypesForSale, function (index, typeId) {
                App.enableBuyButton(typeId);
            });
        },

        enableBuyButton(tokenType) {
            if (!App.captchaResponse) return;

            var quantity = $('[data-token-type="' + tokenType + '"] .quantity');
            var maxPurchaseCap = App.tokenPurchaseCaps[tokenType];
            var isPaused = App.tokenTypePauses[tokenType];

            var isSoldOut = App.isSoldOut(tokenType);

            var canEnable = !isPaused && !isSoldOut && !(quantity > maxPurchaseCap || quantity <= 0);

            if (canEnable) {
                // $('[data-token-type="' + tokenType + '"] .buy').prop('disabled', false);

                $('[data-token-type="' + tokenType + '"] .buy').show();
                $('[data-token-type="' + tokenType + '"] .buy-disabled').hide();
                $('[data-token-type="' + tokenType + '"] .buy-soldout').hide();
            }
        },

        disableBuyButton(tokenType) {
            //$('[data-token-type="' + tokenType + '"] .buy').prop('disabled', true);

            var isSoldOut = App.isSoldOut(tokenType);

            $('[data-token-type="' + tokenType + '"] .buy').hide();

            if (isSoldOut) {
                $('[data-token-type="' + tokenType + '"] .buy-soldout').show();
            } else {
                $('[data-token-type="' + tokenType + '"] .buy-disabled').show();
            }
        },

        init: function () {
            console.log("App init...");

            $.ajaxSetup({ cache: false });

            $.each(App.tokenTypesForSale, function (index, typeId) {
                App.initTokenType(typeId);
            });

            return App.initWeb3();
        },

        initTokenType(typeId) {
            console.log('App initTokenType ' + typeId);

            var type = $('[data-token-type="' + typeId + '"]');

            var quantityInput = type.find('.quantity');
            var priceContainer = type.find('.price-container');
            var priceMatic = type.find('.price-matic');

            quantityInput.val(1);
            App.tokenQuantity[typeId] = new Web3.utils.BN(1);

            quantityInput.change(function () {
                var quantity = quantityInput.val();
                var max = App.tokenPurchaseCaps[typeId];

                if (quantity > max) {
                    this.value = max;
                    quantity = max;
                } else if (quantity < 1) {
                    this.value = 1;
                    quantity = 1;
                }

                if (quantity > max || quantity <= 0) {
                    priceContainer.hide();
                    App.disableBuyButton(typeId);
                } else {
                    priceContainer.show();
                    App.enableBuyButton(typeId);
                }

                App.tokenQuantity[typeId] = new web3.utils.BN(quantity);

                priceMatic.html(web3.utils.fromWei(App.tokenRate[typeId].mul(App.tokenQuantity[typeId]), "ether"));

                App.recalculateUsdPrice(typeId);
            });
        },

        refreshMaticUsdPrice() {
            const aggregatorV3InterfaceABI = [{ "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "description", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint80", "name": "_roundId", "type": "uint80" }], "name": "getRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "latestRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }];
            var addr = App.validNetwork.MaticUsdPriceFeed;
            var priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr);

            priceFeed.methods.latestRoundData().call()
                .then((roundData) => {
                    App.usdRate = roundData.answer / 100000000;
                    App.recalculateUsdPrices();
                });
        },

        recalculateUsdPrices: function () {
            $.each(App.tokenTypesForSale, function (index, typeId) {
                App.recalculateUsdPrice[typeId];
            });
        },

        recalculateUsdPrice: function (typeId) {
            if (App.tokenRate[typeId]) {
                var quantity = App.tokenQuantity[typeId].toNumber();
                var etherPrice = web3.utils.fromWei(App.tokenRate[typeId], "ether");
                var total = quantity * (etherPrice * App.usdRate);

                var tokenType = $('[data-token-type="' + typeId + '"]');
                var priceDolar = tokenType.find('.price-dolar');

                priceDolar.html(total.toFixed(0));
            }
        },

        initWeb3: function () {

            console.log("App initWeb3...");

            if (!MetaMask.isMetaMaskInstalled()) {
                App.showErrorAlert("You must install Metamask into your browser: https://metamask.io/download.html");
                App.hideLoadingText();
                App.hideMetaMaskButtons();
                return;
            }

            ethereum.on('chainChanged', (_chainId) => {
                window.location.reload();
            });

            ethereum.on('accountsChanged', (accounts) => {
                window.location.reload();
            });

            if (typeof web3 !== 'undefined') {
                // If a web3 instance is already provided by Meta Mask.
                App.web3Provider = ethereum;
                web3 = new Web3(ethereum);
            } else {
                // Specify default instance if no web3 instance provided
                App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
                web3 = new Web3(App.web3Provider);
            };

            MetaMask.connectWallet();

            ethereum
                .request({ method: 'eth_chainId' })
                .then((chainId) => {
                    console.log('Connected to chainId: ' + chainId);
                    if (chainId != App.validNetwork.ChainId) {
                        App.showErrorAlert('Wrong network!');
                        MetaMask.switchNetwork();
                        MetaMask.isCorrectNetwork = false;
                        App.hideLoading();
                        $('#content').hide();
                        return;
                    }
                    MetaMask.isCorrectNetwork = true;
                    $('#addNetwork').hide();

                    return App.initContracts();
                }
                );
        },

        initContracts: function () {

            App.refreshMaticUsdPrice();

            $.getJSON("contracts/NftTokenCrowdsale.json", function (nftTokenCrowdsale) {

                const wss = new Web3(App.validNetwork.WebSocket);
                const myContract = new wss.eth.Contract(nftTokenCrowdsale.abi, Contracts.nftTokenCrowdsaleAddress);

                myContract.events.TokenPurchased()
                    .on('data', function (data) {
                        App.refreshTotalSupply(
                            data.returnValues.typeId,
                            data.returnValues.totalSupply);
                    });

                myContract.events.TokenPaused()
                    .on('data', function (data) {
                        App.pause(data.returnValues.typeId);
                    });

                myContract.events.TokenUnpaused()
                    .on('data', function (data) {
                        App.unpause(data.returnValues.typeId);
                    });

                App.contracts.NftTokenCrowdsale = TruffleContract(nftTokenCrowdsale);
                App.contracts.NftTokenCrowdsale.setProvider(App.web3Provider);

                Contracts.nftTokenCrowdsalePromise = App.contracts.NftTokenCrowdsale
                    .at(Contracts.nftTokenCrowdsaleAddress);

                Contracts.nftTokenCrowdsalePromise
                    .then(function (instance) {
                        Contracts.nftTokenCrowdsaleInstance = instance;
                        Contracts.nftTokenCrowdsaleAddress = instance.address;
                    });

                $('.nft-factory .wallet-address').html(Contracts.nftTokenCrowdsaleAddress);
                $('.nft-factory a').attr('href', 'https://mumbai.polygonscan.com/address/' + Contracts.nftTokenCrowdsaleAddress);

            }).done(function () {
                $.getJSON("contracts/NftToken.json", function (nftToken) {
                    App.contracts.NftToken = TruffleContract(nftToken);
                    App.contracts.NftToken.setProvider(App.web3Provider);

                    Contracts.nftTokenPromise = App.contracts.NftToken
                        .at(Contracts.nftTokenAddress);

                    Contracts.nftTokenPromise
                        .then(function (instance) {
                            Contracts.nftTokenInstance = instance;
                            Contracts.nftTokenAddress = instance.address;
                        });

                    $('.nft-token .wallet-address').html(Contracts.nftTokenAddress);
                    $('.nft-token a').attr('href', 'https://mumbai.polygonscan.com/token/' + Contracts.nftTokenAddress);

                    return App.render();
                });
            })
        },

        showLoading: function () {
            App.loading = true;

            var loader = $('#loader');
            var content = $('#content');

            loader.show();
            content.hide();
        },

        hideLoading: function () {
            App.loading = false;
            App.hideLoadingText();
            var content = $('#content');
            content.show();
        },

        hideLoadingText: function () {
            $('#loader').hide();
        },

        refreshTokenBalance: function () {
            App.getLastPurchaseTime(App.account);

            Contracts.nftTokenPromise
                .then(function (instance) {
                    return instance.balanceOf(App.account);
                }).then(function (balance) {
                    $('.dapp-balance').html(balance.toNumber());
                    App.hideLoading();
                })
        },

        refreshTokenRate: function (typeId) {
            Contracts.nftTokenCrowdsalePromise
                .then(function (instance) {
                    instance.getRate(typeId)
                        .then(function (rate) {
                            App.tokenRate[typeId] = rate;

                            var etherPrice = web3.utils.fromWei(App.tokenRate[typeId], "ether");
                            var tokenType = $('[data-token-type="' + typeId + '"]');
                            var priceMatic = tokenType.find('.price-matic');

                            priceMatic.html(etherPrice);

                            App.recalculateUsdPrice(typeId);
                        });
                });
        },

        refreshTokenRates: function () {
            App.refreshTokenRate(App.tokenTypesForSale[0]);
            App.refreshTokenRate(App.tokenTypesForSale[1]);
        },

        refreshTotalSupplies: function () {
            $.each(App.tokenTypesForSale, function (index, typeId) {
                App.getTotalSupply(typeId);
            });
        },

        render: function () {
            if (App.loading) return;

            App.showLoading();
            App.refreshTokenRates();
            App.getTotalMinted();

            $.each(App.tokenTypesForSale, function (index, typeId) {
                App.getTotalSupply(typeId);
                App.getMaxSupply(typeId);
                App.getPurchaseCap(typeId);
                App.isPaused(typeId);
            });

            App.refreshTokenBalance();
        },

        pause: function (typeId) {
            App.tokenTypePauses[typeId] = true;
            App.disableBuyButton(typeId);
            App.showErrorAlert('Token sales paused!');
            $('.alert-container').show();
            $('#captchaWidget').hide();
        },

        unpause: function (typeId) {
            App.tokenTypePauses[typeId] = false;
            App.enableBuyButton(typeId);

            if (App.isAllUnpause()) {
                $('.alert-container').hide();
                $('#captchaWidget').show();
            }
        },

        isAllUnpause: function () {
            var isUnpaused = true;
            $.each(App.tokenTypesForSale, function (index, typeId) {
                if (App.tokenTypePauses[typeId] == true) {
                    isUnpaused = false;
                }
            });
            return isUnpaused;
        },

        isPaused: function (typeId) {
            Contracts.nftTokenCrowdsalePromise
                .then(function (instance) {
                    instance.isPaused(typeId)
                        .then(function (isPaused) {
                            if (isPaused == true) {
                                App.pause(typeId);
                            } else {
                                App.unpause(typeId);
                            }
                        });
                });
        },

        getTotalMinted: function () {
            Contracts.nftTokenCrowdsalePromise
                .then(function (instance) {
                    instance.getTotalMinted()
                        .then(function (totalMinted) {
                            $('.tokens-sold').html(totalMinted);
                        });
                });
        },

        getTotalSupply: function (typeId) {
            Contracts.nftTokenCrowdsalePromise
                .then(function (instance) {
                    instance.getTotalSupply(typeId)
                        .then(function (totalSupply) {
                            App.refreshTotalSupply(typeId, totalSupply.toNumber());
                        });
                });
        },

        refreshTotalSupply: function (typeId, totalSupply) {
            App.tokenTotalSupply[typeId] = totalSupply;
            var _tokenType = $('[data-token-type="' + typeId + '"]');
            var _totalSupply = _tokenType.find('.total-supply');
            _totalSupply.html(totalSupply);
            App.checkSoldOut(typeId);
        },

        getMaxSupply: function (typeId) {
            Contracts.nftTokenCrowdsalePromise
                .then(function (instance) {
                    instance.getMaxSupply(typeId)
                        .then(function (maxSupply) {
                            var _tokenType = $('[data-token-type="' + typeId + '"]');
                            var _maxSupply = _tokenType.find('.max-supply');
                            App.tokenMaxSupply[typeId] = maxSupply.toNumber();
                            _maxSupply.html(maxSupply.toNumber());
                            App.checkSoldOut(typeId);
                        });
                });
        },

        getPurchaseCap: function (typeId) {
            Contracts.nftTokenCrowdsalePromise
                .then(function (instance) {
                    instance.getPurchaseCap(typeId)
                        .then(function (purchaseCap) {
                            var _tokenType = $('[data-token-type="' + typeId + '"]');
                            var _purchaseCap = _tokenType.find('.purchase-cap');
                            var _quantity = _tokenType.find('.quantity');

                            App.tokenPurchaseCaps[typeId] = purchaseCap.toNumber();

                            _quantity.attr('max', purchaseCap)
                            _purchaseCap.html(purchaseCap.toNumber());
                        });
                });
        },

        getCalmDownSeconds: function () {
            Contracts.nftTokenCrowdsalePromise
                .then(function (instance) {
                    instance.getCoolDownSeconds()
                        .then(function (coolDownSeconds) {
                            App.coolDownSeconds = coolDownSeconds.toNumber();
                            App.calculateCountdown();
                        });
                });
        },

        getLastPurchaseTime: function (address) {
            Contracts.nftTokenCrowdsalePromise
                .then(function (instance) {
                    instance.getLastPurchaseTime(address)
                        .then(function (lastPurchaseTime) {
                            App.getCalmDownSeconds();
                            App.lastPurchaseTime = lastPurchaseTime.toNumber();
                            App.calculateCountdown();
                        });
                });
        },

        resetCaptcha: function () {
            grecaptcha.reset(App.captchaWidget);
            App.disableBuyButtons();
            App.captchaResponse = null;
        },

        getTokenQuantity: function (typeId) {
            return App.tokenQuantity[typeId];
        },

        getTokenPrice: function (typeId) {
            return App.tokenRate[typeId].mul(App.tokenQuantity[typeId]);
        },

        calculateGas: function (quantity) {
            const startCost = 90000;
            const mintCost = 180000;
            return startCost + (mintCost * quantity);
        },

        resetForm: function () {
            App.resetAlerts();
            App.resetCaptcha();
            App.hideLoading();
        },

        buyTokens: function (typeId) {
            console.log("App buyTokens...");

            if (!MetaMask.isWalletConnected) {
                App.showErrorAlert('Wallet not connected!');
                return;
            }

            if (!MetaMask.isCorrectNetwork) {
                App.showErrorAlert('Wrong network!');
                return;
            }

            if (App.countdownSeconds > 0) {
                return;
            }

            if (!App.captchaResponse) {
                App.showErrorAlert('Captcha not solved!');
                return;
            }

            App.resetAlerts();

            $('#content').hide();
            $('#loader').show();

            Contracts.nftTokenCrowdsalePromise
                .then(function (instance) {
                    var quantity = App.getTokenQuantity(typeId);
                    var quantityBN = new web3.utils.BN(quantity);
                    var price = App.getTokenPrice(typeId);
                    var calculatedGas = App.calculateGas(quantity);

                    App.resetForm();
                    App.showSuccessAlert('Minting...');

                    return instance.buyTokens(App.account, typeId, quantityBN, {
                        from: App.account,
                        value: price,
                        gasPrice: 75000000000 // 75 Gwei
                    });

                }).then(function (result) {
                    App.showSuccessAlert('Tokens minted, check your wallet!');
                    App.refreshTokenBalance();
                    App.getTotalSupply(typeId);

                }).catch(function (error) {
                    var startIndex = error.message.indexOf('revert');
                    var endIndex = error.message.indexOf('","code"');

                    if (endIndex > startIndex) {
                        App.showErrorAlert(error.message.substring(startIndex, endIndex));
                    } else {
                        startIndex = 0;
                        endIndex = error.message.indexOf(':\n{\n  "blockHash');
                        if (endIndex > startIndex) {
                            App.showErrorAlert(error.message.substring(startIndex, endIndex));
                        } else {
                            App.showErrorAlert(error.message);
                        }
                    }

                    App.hideLoading();
                });
        },

        calculateCountdown: function () {
            if (App.coolDownSeconds == null) return;

            App.nextPurchaseTime = App.lastPurchaseTime + App.coolDownSeconds;

            web3.eth.getBlock('latest').then(function (data) {
                var now = data.timestamp;
                var seconds = App.nextPurchaseTime - now;

                if (App.timerId != null) return;

                App.countdownSeconds = seconds;
                if (seconds > 0) {
                    App.enableCountdown();
                }
            });
        },

        enableCountdown: function () {
            $('.alert-container').show();
            $('#captchaWidget').hide();
            $('.countdownWidget').show();
            App.timerId = setInterval(
                App.doCountdown,
                1000
            )
        },

        disableCountdown: function () {
            clearInterval(App.timerId);
            App.timerId = null;
            $('#captchaWidget').show();
            $('.alert-container').hide();
            $('.countdownWidget').hide();
        },

        doCountdown: function () {
            var seconds = App.countdownSeconds--;
            var countdownTimer = $('.countdownTimer');
            countdownTimer.html(seconds);
            if (seconds <= 0) {
                App.disableCountdown();
            }
        },
    },

    $(function () {
        $(window).on('load', function () {
            App.init();
        });
    });