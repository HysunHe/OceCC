
# Remote deployment
#ssh -i /home/hysunhe/projects/BetterBot/credentials/sehub/id_rsa opc@mileoda.hysun.cloudns.asia -t "sudo su - oracle -c ./deploy-ceair-connectors.sh"

ssh -i /Users/mw-mac/Documents/ODA/ODA_CEC/id_rsa opc@mileoda.hysun.cloudns.asia -t "sudo su - oracle -c ./deploy-ocecc.sh"
