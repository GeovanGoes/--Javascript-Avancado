import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Alert } from 'ionic-angular';
import { Carro } from '../../modelos/carro';
import { AgendamentosServiceProvider } from '../../providers/agendamentos-service/agendamentos-service';
import { HomePage } from '../home/home';
import { Agendamento } from '../../modelos/agendamento';
import { AgendamentoDaoProvider } from '../../providers/agendamento-dao/agendamento-dao';

/**
 * Generated class for the CadastroPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cadastro',
  templateUrl: 'cadastro.html',
})
export class CadastroPage {

  public carro: Carro;
  public precoTotal: number;

  public nome: string = '';
  public endereco: string = '';
  public email: string = '';
  public data: string = new Date().toISOString();

  private alerta: Alert;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private agendamentosService: AgendamentosServiceProvider,
    private alertController: AlertController,
    private agendamentoDAO: AgendamentoDaoProvider) {
    this.carro = this.navParams.get('carroSelecionado');
    this.precoTotal = this.navParams.get('precoTotal');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CadastroPage');
  }

  agenda()
  {
    if (!this.nome || !this.endereco || !this.email)
    {
      this.alertController.create({
        title: 'Preenchimento obrigatório',
        subTitle: 'Preencha todos os campos',
        buttons: [ { text: 'OK' }]
      }).present();
      return;
    }

    let mensagem: string = '';

    this.alerta = this.alertController.create({
      title: 'Aviso',
      buttons: [
        { text: 'OK', handler: () => { this.navCtrl.setRoot(HomePage) } }
      ]
    });

    let agendamento: Agendamento = 
                                    {
                                      nomeCliente: this.nome,
                                      enderecoCliente: this.endereco,
                                      emailCliente: this.email,
                                      modeloCarro: this.carro.nome,
                                      precoTotal: this.precoTotal,
                                      data: this.data,
                                      confirmado: false,
                                      enviado: false,
                                    };
    this.agendamentoDAO.ehDuplicado(agendamento)
    .mergeMap(ehDuplicado => {
      if (ehDuplicado)
        throw new Error('Agendamento existente');
      return this.agendamentosService.agenda(agendamento);
    })                                
    .mergeMap((valor) => {
      let observable = this.agendamentoDAO.salva(agendamento);
      if (valor instanceof Error)
      {
        throw valor;
      }
      return observable;
    })
    .finally
    (
      () => 
      {
        this.alerta.setSubTitle(mensagem).present();
      }
    )
    .subscribe(
      () => mensagem = 'Agendamento realizado', 
      (erro: Error) => mensagem = erro.message
    );
  }


}
