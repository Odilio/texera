import { Point } from './../../types/common.interface';
import { OperatorPredicate } from './../../types/workflow-graph';
import { getMockResultPredicate, getMockPoint } from './../workflow-graph/model/mock-workflow-data';
import { TestBed, inject } from '@angular/core/testing';
import * as joint from 'jointjs';

import { JointUIService, deleteButtonPath, sourceOperatorHandle, targetOperatorHandle } from './joint-ui.service';
import { OperatorMetadataService } from '../operator-metadata/operator-metadata.service';
import { StubOperatorMetadataService } from '../operator-metadata/stub-operator-metadata.service';
import { getMockScanPredicate, getMockSentimentPredicate } from '../workflow-graph/model/mock-workflow-data';

describe('JointUIService', () => {
  let service: JointUIService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        JointUIService,
        { provide: OperatorMetadataService, useClass: StubOperatorMetadataService },
      ],
    });
    service = TestBed.get(JointUIService);
  });

  it('should be created', inject([JointUIService], (injectedService: JointUIService) => {
    expect(injectedService).toBeTruthy();
  }));

  /**
   * Check if the getJointjsOperatorElement() can successfully creates a JointJS Element
   */
  it('should create an JointJS Element successfully when the function is called', () => {
    const result = service.getJointjsOperatorElement(
      getMockScanPredicate(), getMockPoint());
    expect(result).toBeTruthy();
  });

  /**
   * Check if the error in getJointjsOperatorElement() is correctly thrown
   */
  it('should throw an error with an non existing operator', () => {
    expect(() => {
      service.getJointjsOperatorElement(
        {
          operatorID: 'nonexistOperator',
          operatorType: 'nonexistOperatorType',
          operatorProperties: {},
          inputPorts: [],
          outputPorts: []
        },
        getMockPoint()
      );
    }).toThrowError();
  });


  /**
   * Check if the number of inPorts and outPorts created by getJointjsOperatorElement()
   * matches the port number specified by the operator metadata
   */
  it('should create correct number of inPorts and outPorts based on operator metadata', () => {
    const element1 = service.getJointjsOperatorElement(getMockScanPredicate(), getMockPoint());
    const element2 = service.getJointjsOperatorElement(getMockSentimentPredicate(), getMockPoint());
    const element3 = service.getJointjsOperatorElement(getMockResultPredicate(), getMockPoint());

    const inPortCount1 = element1.getPorts().filter(port => port.group === 'in').length;
    const outPortCount1 = element1.getPorts().filter(port => port.group === 'out').length;
    const inPortCount2 = element2.getPorts().filter(port => port.group === 'in').length;
    const outPortCount2 = element2.getPorts().filter(port => port.group === 'out').length;
    const inPortCount3 = element3.getPorts().filter(port => port.group === 'in').length;
    const outPortCount3 = element3.getPorts().filter(port => port.group === 'out').length;

    expect(inPortCount1).toEqual(0);
    expect(outPortCount1).toEqual(1);
    expect(inPortCount2).toEqual(1);
    expect(outPortCount2).toEqual(1);
    expect(inPortCount3).toEqual(1);
    expect(outPortCount3).toEqual(0);

  });

  /**
   * Check if the custom attributes / svgs are correctly used by the JointJS graph
   */
  it('should apply the custom SVG styling to the JointJS element', () => {

    const graph = new joint.dia.Graph();

    graph.addCell(
      service.getJointjsOperatorElement(
        getMockScanPredicate(),
        getMockPoint()
      )
    );

    graph.addCell(
      service.getJointjsOperatorElement(
        getMockResultPredicate(),
        { x: 500, y: 100 }
      )
    );

    const link = service.getJointjsLinkElement(
      { operatorID: getMockScanPredicate().operatorID, portID: getMockScanPredicate().outputPorts[0] },
      { operatorID: getMockResultPredicate().operatorID, portID: getMockResultPredicate().inputPorts[0] }
    );

    graph.addCell(link);

    const graph_operator1 = graph.getCell(getMockScanPredicate().operatorID);
    const graph_operator2 = graph.getCell(getMockResultPredicate().operatorID);
    const graph_link = graph.getLinks()[0];

    // testing getCustomOperatorStyleAttrs()
    expect(graph_operator1.attr('rect')).toEqual(
      { fill: '#FFFFFF', 'follow-scale': true, stroke: '#CFCFCF', 'stroke-width': '2' }
    );
    expect(graph_operator2.attr('rect')).toEqual(
      { fill: '#FFFFFF', 'follow-scale': true, stroke: '#CFCFCF', 'stroke-width': '2' }
    );
    expect(graph_operator1.attr('.delete-button')).toEqual(
      {
        x: 135, y: -20, cursor: 'pointer',
        fill: '#D8656A', event: 'element:delete'
      }
    );
    expect(graph_operator2.attr('.delete-button')).toEqual(
      {
        x: 135, y: -20, cursor: 'pointer',
        fill: '#D8656A', event: 'element:delete'
      }
    );

    // testing getDefaultLinkElement()
    expect(graph_link.attr('.marker-source/d')).toEqual(sourceOperatorHandle);
    expect(graph_link.attr('.marker-target/d')).toEqual(targetOperatorHandle);
    expect(graph_link.attr('.tool-remove path/d')).toEqual(deleteButtonPath);
  });
});