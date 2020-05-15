
# Remote deployment
#ssh -i /home/hysunhe/projects/BetterBot/credentials/sehub/id_rsa opc@o100.odainfra.com -t "sudo su - oracle -c ./deploy-ceair-connectors.sh"

ssh -i /Users/mw-mac/Documents/ODA/ODA_CEC/id_rsa opc@oracle.doitchina.com -t "sudo su - oracle -c ./deploy-ocecc.sh"
